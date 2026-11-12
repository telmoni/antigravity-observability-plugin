/**
 * The worker the hook starts, detached: under the conversation's lock it reads the transcript once it has settled,
 * sends each turn that can no longer change, keeps what Telmoni could not take, then sends what others left.
 */

import { existsSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

import type { TraceRecord } from 'telmoni';

import type { Stop } from './payload.js';
import { keyFile, stateDir } from './paths.js';
import { type Ending, recordTurn, traceIdOf } from './record.js';
import { kindOf, shortId, writeLog } from './shared/log.js';
import {
  type Destination,
  Sender,
  type SenderOptions,
  isDone,
  verdictLine,
} from './shared/send.js';
import { type Settings, destinationOf, resolveSettings } from './shared/settings.js';
import {
  ensurePrivateDir,
  markedIds,
  readStateFile,
  withLock,
  writeStateFile,
} from './shared/state.js';
import { tagTrace } from './shared/tags.js';
import { readTranscript } from './transcript.js';
import { after, cut, endedBy, isComplete } from './turns.js';

/** The trace ids a conversation remembers sending, newest last. */
export const SENT_MAX = 500;
/** The traces a conversation keeps for Telmoni, oldest first: past this, the oldest go. */
export const PENDING_MAX = 200;

/** A conversation's file, `<conversation>.json`. */
export interface State {
  /** The step of the first prompt not yet done with; turns before it were sent, or passed over. */
  cursor?: number;
  sent: string[];
  /** Traces Telmoni could not take yet, with their conversation where content is on. */
  pending: TraceRecord[];
  /** How the stops heard so far ended each turn not yet sent, by its prompt's step. */
  ends: Record<string, Ending>;
  /** The once-a-conversation lines already logged. */
  warned: string[];
  /** Where its traces go, as a digest of the endpoint under the key: kept traces go nowhere else. */
  destination?: string;
}

export interface WorkOptions {
  env: Readonly<Record<string, string | undefined>>;
  /** The home folder `.gemini/config` is under; the person's own unless a test names one. */
  home?: string | undefined;
  /** The SDK's transport and wait, for a test. */
  hooks?: SenderOptions['hooks'];
  /** How long the transcript must stay still before it is read, and the longest to wait for that. */
  settleMs?: number | undefined;
  settleMaxMs?: number | undefined;
  /** How long to wait for another hook at work on the same conversation. */
  lockWaitMs?: number | undefined;
}

type Log = (line: string) => void;

const NO_KEY = 'no key: set TELMONI_API_KEY, or write ~/.gemini/config/telmoni.json';
const NO_ENDPOINT =
  'no endpoint: set TELMONI_ENDPOINT, or "endpoint" in the key file, to your self-hosted Telmoni';

/** Everything one stop sets off; it never throws, every fault a line in the log. */
export async function work(stop: Stop, options: WorkOptions): Promise<void> {
  const dir = stateDir(options.home);
  const log: Log = (line) => writeLog(dir, `${shortId(stop.conversationId)} ${line}`);
  try {
    ensurePrivateDir(dir, { tighten: true });
    const settings = resolveSettings({ env: options.env, keyFiles: [keyFile(options.home)] });
    let destination: string | undefined;
    const took = await withLock(
      dir,
      stop.conversationId,
      options.lockWaitMs ?? 60_000,
      async () => {
        const state = load(dir, stop.conversationId, log);
        if (state === undefined) return;
        try {
          destination = await own(stop, state, settings, options, dir, log);
        } finally {
          save(dir, stop.conversationId, state);
        }
      },
    );
    if (!took) log('another hook holds the conversation: its turns wait for the next');
    if (destination !== undefined)
      await leftovers(dir, stop.conversationId, destination, settings, options);
  } catch (error) {
    log(`fault: ${kindOf(error)}`);
  }
}

/** The conversation's own turns; the destination it sent to, where every trace it kept went. */
async function own(
  stop: Stop,
  state: State,
  settings: Settings,
  options: WorkOptions,
  dir: string,
  log: Log,
): Promise<string | undefined> {
  const warned = new Set(state.warned);
  const once = (line: string): void => {
    if (!warned.has(line)) log(line);
    warned.add(line);
  };
  try {
    if (settings.keyFileProblem !== undefined)
      return void once(`key file not read: ${settings.keyFileProblem}; nothing is sent`);
    if (settings.apiKey === undefined) return void once(NO_KEY);
    if (settings.endpoint === undefined) return void once(NO_ENDPOINT);
    const destination = destinationOf(settings);
    if (
      state.destination !== undefined &&
      state.destination !== destination &&
      state.pending.length > 0
    ) {
      log(`${state.pending.length} kept turns dropped: the key or the endpoint changed`);
      state.pending = [];
    }
    state.destination = destination;

    await settle(stop.transcriptPath, options.settleMs ?? 500, options.settleMaxMs ?? 3_000);
    const read = readTranscript(stop.transcriptPath, { content: settings.captureContent });
    if ('problem' in read) return void log(read.problem);
    const turns = cut(read.rows);
    const ended = endedBy(turns, stop);
    if (ended !== undefined) state.ends[String(ended.open.index)] = endingOf(stop);
    // A conversation first heard of is recorded from the turn this stop ended: its history before stays home.
    const cursor = state.cursor ?? ended?.open.index;
    if (cursor === undefined) return undefined;
    state.cursor = cursor;

    let sender: Sender;
    try {
      sender = new Sender(sendingTo(settings), { hooks: options.hooks });
    } catch (error) {
      if (error instanceof TypeError) return void once(`endpoint refused: ${error.message}`);
      throw error;
    }
    try {
      await sendKept(state, sender, dir, stop.conversationId, log);
      for (const turn of turns) {
        if (turn.open.index < (state.cursor ?? cursor)) continue;
        const traceId = traceIdOf(stop.conversationId, turn.open.index);
        if (!isComplete(turn, ended, stop)) {
          log(`held ${shortId(traceId)}: its turn is not over yet`);
          break;
        }
        state.cursor = after(turn);
        const ending = state.ends[String(turn.open.index)];
        if (state.sent.includes(traceId)) continue;
        const record = recordTurn(turn, {
          conversationId: stop.conversationId,
          modelName: stop.modelName,
          ending,
          content: settings.captureContent,
        });
        if (record === undefined) continue;
        tagTrace(record, stop.workspace, warned, log);
        // Behind a kept trace, in order: Telmoni gets a conversation's turns as they came.
        if (state.pending.length > 0 || !(await deliver(sender, record, log)))
          state.pending.push(record);
        else remember(state, record.traceId);
        save(dir, stop.conversationId, state);
      }
    } finally {
      await sender.close();
    }
    for (const key of Object.keys(state.ends)) {
      if (Number(key) < (state.cursor ?? cursor)) delete state.ends[key];
    }
    if (state.pending.length > PENDING_MAX) {
      const dropped = state.pending.length - PENDING_MAX;
      state.pending.splice(0, dropped);
      log(`${dropped} kept turns dropped, the oldest: past ${PENDING_MAX} waiting`);
    }
    return state.pending.length === 0 ? destination : undefined;
  } finally {
    state.warned = [...warned];
  }
}

function sendingTo(settings: Settings): Destination {
  return {
    endpoint: settings.endpoint,
    apiKey: settings.apiKey ?? '',
    captureContent: settings.captureContent,
    scrubSecrets: settings.scrubSecrets,
    scrubPii: settings.scrubPii,
  };
}

function endingOf(stop: Stop): Ending {
  const ending: Ending = { at: stop.at };
  if (stop.reason !== undefined) ending.reason = stop.reason;
  if (stop.errored) ending.errored = true;
  return ending;
}

/** Sends one trace and logs what became of it; true where it is done with, false where it is to go again. */
async function deliver(sender: Sender, record: TraceRecord, log: Log): Promise<boolean> {
  const verdict = await sender.send(record);
  const line = verdictLine(verdict);
  const trace = shortId(record.traceId);
  if (!isDone(verdict)) {
    log(`kept ${trace}, ${line ?? 'not sent'}`);
    return false;
  }
  log(line === undefined ? `sent ${trace}` : `${trace} ${line}`);
  return true;
}

function remember(state: State, traceId: string): void {
  state.sent.push(traceId);
  if (state.sent.length > SENT_MAX) state.sent.splice(0, state.sent.length - SENT_MAX);
}

/** The conversation's kept traces, oldest first, until one is kept again; true once none is left. */
async function sendKept(
  state: State,
  sender: Sender,
  dir: string,
  id: string,
  log: Log,
): Promise<boolean> {
  for (let record = state.pending[0]; record !== undefined; record = state.pending[0]) {
    if (!(await deliver(sender, record, log))) return false;
    state.pending.shift();
    remember(state, record.traceId);
    save(dir, id, state);
  }
  return true;
}

/**
 * What other conversations kept, the longest waiting first, each under its own lock taken without waiting, and only
 * where it was meant for the same destination; stops at the first Telmoni still cannot take.
 */
async function leftovers(
  dir: string,
  own: string,
  destination: string,
  settings: Settings,
  options: WorkOptions,
): Promise<void> {
  for (const id of markedIds(dir, '.pending', own)) {
    const log: Log = (line) => writeLog(dir, `${shortId(id)} ${line}`);
    let blocked = false;
    await withLock(dir, id, 0, async () => {
      const state = load(dir, id, log);
      if (state === undefined || state.destination !== destination) return;
      const sender = new Sender(sendingTo(settings), { hooks: options.hooks });
      try {
        blocked = !(await sendKept(state, sender, dir, id, log));
      } finally {
        await sender.close();
        save(dir, id, state);
      }
    });
    if (blocked) return;
  }
}

/** Waits until the transcript has stayed still for `stillMs`, `maxMs` at most: a stop can land before its last step. */
async function settle(path: string, stillMs: number, maxMs: number): Promise<void> {
  const signature = (): string => {
    try {
      const { size, mtimeMs } = statSync(path);
      return `${size}:${mtimeMs}`;
    } catch {
      return 'none';
    }
  };
  const deadline = Date.now() + maxMs;
  let seen = signature();
  let since = Date.now();
  while (Date.now() < deadline) {
    await sleep(Math.min(100, stillMs));
    const now = signature();
    if (now !== seen) {
      seen = now;
      since = Date.now();
    } else if (Date.now() - since >= stillMs) {
      return;
    }
  }
}

/** A conversation's state, new where none was saved; undefined, logged, where one cannot be read: read as new, it would lose its kept traces. */
function load(dir: string, id: string, log: Log): State | undefined {
  let raw: Record<string, unknown> | undefined;
  try {
    raw = readStateFile(dir, id);
  } catch (error) {
    log(`state unreadable (${kindOf(error)}): nothing is sent until it is fixed or moved aside`);
    return undefined;
  }
  const state = parseState(raw);
  const kept = Array.isArray(raw?.pending) ? raw.pending.length : 0;
  if (kept > state.pending.length)
    log(`dropped ${kept - state.pending.length} kept in a shape no longer sent`);
  return state;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function parseState(raw: Record<string, unknown> | undefined): State {
  const state: State = { sent: [], pending: [], ends: {}, warned: [] };
  if (raw === undefined) return state;
  if (typeof raw.cursor === 'number' && Number.isSafeInteger(raw.cursor) && raw.cursor >= 0)
    state.cursor = raw.cursor;
  if (Array.isArray(raw.sent))
    state.sent = raw.sent.filter((id): id is string => typeof id === 'string').slice(-SENT_MAX);
  if (Array.isArray(raw.pending))
    // One with no trace id was kept by a release that named it otherwise: it is not sent.
    state.pending = raw.pending.filter(
      (kept) => isRecord(kept) && typeof kept.traceId === 'string',
    ) as unknown as TraceRecord[];
  if (isRecord(raw.ends)) {
    for (const [key, value] of Object.entries(raw.ends)) {
      if (!/^\d{1,9}$/.test(key) || !isRecord(value) || typeof value.at !== 'number') continue;
      const ending: Ending = { at: value.at };
      if (typeof value.reason === 'string') ending.reason = value.reason;
      if (value.errored === true) ending.errored = true;
      state.ends[key] = ending;
    }
  }
  if (Array.isArray(raw.warned))
    state.warned = raw.warned.filter((line): line is string => typeof line === 'string');
  if (typeof raw.destination === 'string') state.destination = raw.destination;
  return state;
}

/** Saves the state whole, and marks the conversation as holding kept traces while it does, so any hook finds them. */
function save(dir: string, id: string, state: State): void {
  writeStateFile(dir, id, state);
  const marker = join(dir, `${id}.pending`);
  if (state.pending.length === 0) rmSync(marker, { force: true });
  // Made once, so the longest waiting goes first.
  else if (!existsSync(marker)) writeFileSync(marker, '', { mode: 0o600 });
}
