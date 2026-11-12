/**
 * Fixtures, all synthetic: a transcript written as Antigravity 1.4 writes one, the `Stop` payload it hands a hook, a
 * home folder of the test's own, a stand-in for Telmoni, and the marked phrases nothing of a session may leak past.
 */

import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Transport } from 'telmoni';
import { afterAll, expect } from 'vitest';

import { type Stop, readStop } from '../src/payload.js';
import { stateDir } from '../src/paths.js';
import { type WorkOptions, work } from '../src/worker.js';

export const CONVERSATION = '1d234444-eeca-405b-a669-8f1000dc12f3';
export const KEY = 'tm_test_0123456789abcdef';
export const ENDPOINT = 'https://telmoni.example.com';
/** The first prompt's time: the clock moves a second a step. */
export const T0 = Date.parse('2026-11-05T22:00:00Z');

/**
 * Phrases planted wherever a session says something, or names a place: none may reach an export, the state or the
 * log while content is off.
 */
export const SECRETS = {
  prompt: 'SECRET-PROMPT-7f3a',
  metadata: 'SECRET-METADATA-/home/someone/project',
  reply: 'SECRET-REPLY-91bc',
  thinking: 'SECRET-THINKING-2d4e',
  args: 'SECRET-ARGS-5a6b',
  output: 'SECRET-OUTPUT-c8d9',
  error: 'SECRET-ERROR-e0f1',
  system: 'SECRET-SYSTEM-1a2b',
  summary: 'SECRET-SUMMARY-3c4d',
  lastUserInput: 'SECRET-LAST-INPUT-4e5f',
  finalModelOutput: 'SECRET-FINAL-OUTPUT-6a7b',
  workspace: 'secret-workspace-8c9d',
  artifacts: 'secret-artifacts-0e1f',
} as const;

/** Fails on any marked phrase, the key, or the transcript's or workspace's path in `text`. */
export function assertMetadataOnly(text: string, also: readonly string[] = []): void {
  for (const secret of [...Object.values(SECRETS), KEY, ...also]) {
    expect(text.includes(secret), `"${secret}" leaked`).toBe(false);
  }
}

export interface Tokens {
  input: number;
  output: number;
  cache?: number;
}

/** A conversation's transcript, written a step at a time as Antigravity does. */
export class Transcript {
  readonly root: string;
  readonly path: string;
  readonly workspace: string;
  readonly rows: Array<Record<string, unknown>> = [];
  #clock = T0;

  constructor(
    home: string,
    readonly conversationId: string = CONVERSATION,
  ) {
    this.root = join(home, '.gemini', 'antigravity-cli', 'brain', conversationId);
    this.path = join(this.root, '.system_generated', 'logs', 'transcript_full.jsonl');
    this.workspace = join(home, SECRETS.workspace);
    mkdirSync(join(this.root, '.system_generated', 'logs'), { recursive: true });
    mkdirSync(this.workspace, { recursive: true });
  }

  /** The clock, in ms: the time the next step is written at. */
  get now(): number {
    return this.#clock;
  }

  wait(seconds: number): this {
    this.#clock += seconds * 1000;
    return this;
  }

  #row(fields: Record<string, unknown>): number {
    const index = this.rows.length;
    this.rows.push({
      step_index: index,
      status: 'DONE',
      created_at: new Date(this.#clock).toISOString().replace(/\.\d{3}Z$/, 'Z'),
      ...fields,
    });
    this.#clock += 1000;
    this.write();
    return index;
  }

  prompt(text: string = SECRETS.prompt): number {
    const content = `<USER_REQUEST>\n${text}\n</USER_REQUEST>\n<ADDITIONAL_METADATA>\nThe current local time is: 2026-11-05T16:00:00-06:00. ${SECRETS.metadata}\n</ADDITIONAL_METADATA>`;
    return this.#row({ source: 'USER_EXPLICIT', type: 'USER_INPUT', content });
  }

  reply(
    options: { tools?: string[]; tokens?: Tokens; text?: string; thinking?: string } = {},
  ): number {
    const row: Record<string, unknown> = { source: 'MODEL', type: 'PLANNER_RESPONSE' };
    const tokens = options.tokens ?? { input: 1200, output: 80, cache: 4000 };
    row.input_tokens = tokens.input;
    row.cache_read_tokens = tokens.cache ?? 0;
    row.output_tokens = tokens.output;
    if (options.tools !== undefined)
      row.tool_calls = options.tools.map((name) => ({
        name,
        args: { CommandLine: SECRETS.args, toolSummary: SECRETS.args },
      }));
    else row.content = options.text ?? SECRETS.reply;
    row.thinking = options.thinking ?? SECRETS.thinking;
    return this.#row(row);
  }

  result(
    options: { type?: string; status?: string; exitCode?: number; content?: string } = {},
  ): number {
    const row: Record<string, unknown> = {
      source: 'MODEL',
      type: options.type ?? 'GENERIC',
      status: options.status ?? 'DONE',
    };
    row.content =
      options.content ??
      `Created At: 2026-11-05T16:00:01-06:00\nCommand output:\n${SECRETS.output}`;
    if (options.exitCode !== undefined) row.exit_code = options.exitCode;
    return this.#row(row);
  }

  error(code?: number): number {
    const row: Record<string, unknown> = {
      source: 'SYSTEM',
      type: 'ERROR_MESSAGE',
      error: SECRETS.error,
      content: SECRETS.error,
    };
    if (code !== undefined) row.error_code = code;
    return this.#row(row);
  }

  system(): number {
    return this.#row({ source: 'SYSTEM', type: 'SYSTEM_MESSAGE', content: SECRETS.system });
  }

  checkpoint(tokens?: Tokens): number {
    const row: Record<string, unknown> = {
      source: 'SYSTEM',
      type: 'CHECKPOINT',
      content: SECRETS.summary,
    };
    if (tokens !== undefined)
      Object.assign(row, {
        input_tokens: tokens.input,
        output_tokens: tokens.output,
        cache_read_tokens: tokens.cache ?? 0,
      });
    return this.#row(row);
  }

  /** A whole turn: a prompt, a call of each tool with its result, and the last reply. */
  turn(tools: string[] = ['run_command']): this {
    this.prompt();
    if (tools.length > 0) {
      this.reply({ tools });
      for (const _ of tools) this.result();
    }
    this.reply();
    return this;
  }

  /** Writes every row, in step order unless `order` says another, as Antigravity can write a reply after its results. */
  write(order?: readonly number[]): void {
    const rows = order === undefined ? this.rows : order.map((index) => this.rows[index]);
    writeFileSync(this.path, rows.map((row) => `${JSON.stringify(row)}\n`).join(''));
  }

  /** Antigravity's `Stop` payload, the prompt and the last answer in it, as a hook reads it on stdin. */
  stopPayload(
    options: { idle?: boolean; reason?: string; error?: string; model?: string } = {},
  ): Record<string, unknown> {
    return {
      conversationId: this.conversationId,
      workspacePaths: [this.workspace],
      transcriptPath: this.path,
      artifactDirectoryPath: join(this.root, SECRETS.artifacts),
      modelName: options.model ?? 'gemini-3.8-flash-low',
      lastUserInput: SECRETS.lastUserInput,
      executionNum: 0,
      terminationReason: options.reason ?? 'NO_TOOL_CALL',
      error: options.error ?? '',
      fullyIdle: options.idle ?? true,
      finalModelOutput: SECRETS.finalModelOutput,
    };
  }

  /** The stop the hook keeps, at the clock's time or `at`, with the transcript's size as it finds it unless `sized` is false. */
  stop(
    options: Parameters<Transcript['stopPayload']>[0] & { at?: number; sized?: boolean } = {},
  ): Stop {
    const stop = readStop(this.stopPayload(options), options.at ?? this.#clock);
    if (stop === undefined) throw new Error('the payload names no stop');
    if (options.sized !== false && existsSync(this.path)) stop.size = statSync(this.path).size;
    return stop;
  }
}

const homes: string[] = [];

/** A home folder of the test's own, its `.gemini/config` made; removed once its file's tests are done. */
export function makeHome(): string {
  const home = mkdtempSync(join(tmpdir(), 'telmoni-agy-'));
  homes.push(home);
  mkdirSync(join(home, '.gemini', 'config'), { recursive: true });
  return home;
}

afterAll(() => {
  for (const home of homes.splice(0)) rmSync(home, { recursive: true, force: true });
});

/** Writes `~/.gemini/config/telmoni.json`, mode 600 unless `mode` says another. */
export function writeKeyFile(home: string, fields: Record<string, unknown>, mode = 0o600): void {
  const path = join(home, '.gemini', 'config', 'telmoni.json');
  writeFileSync(path, JSON.stringify(fields), { mode });
  chmodSync(path, mode);
}

export interface Answer {
  status: number;
  headers?: Record<string, string>;
  body?: unknown;
}

/** Stands in for Telmoni's ingest: keeps every export and answers as told, then with a 200 naming the content mode. */
export class FakeTelmoni {
  readonly requests: Array<{ url: string; headers: Record<string, string>; body: string }> = [];
  answers: Array<Answer | Error> = [];
  mode: 'on' | 'off' = 'off';
  /** Out of reach: every request fails as a network does. */
  offline = false;

  readonly send: Transport = async (url, init) => {
    if (this.offline) throw new Error('offline');
    if (init.method === 'POST')
      this.requests.push({ url, headers: { ...init.headers }, body: init.body });
    const next = init.method === 'POST' ? this.answers.shift() : { status: 204 };
    if (next instanceof Error) throw next;
    const answer = next ?? { status: 200, body: { partialSuccess: null } };
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Telmoni-Content-Mode': this.mode,
      ...answer.headers,
    };
    return {
      status: answer.status,
      headers: {
        get: (name: string) =>
          Object.entries(headers).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1] ??
          null,
      },
      text: () => Promise.resolve(answer.body === undefined ? '' : JSON.stringify(answer.body)),
    };
  };

  spans(): Span[] {
    return this.requests.flatMap((request) => {
      const body = JSON.parse(request.body) as {
        resourceSpans?: Array<{ scopeSpans?: Array<{ spans?: Span[] }> }>;
      };
      return (body.resourceSpans ?? []).flatMap((resource) =>
        (resource.scopeSpans ?? []).flatMap((scope) => scope.spans ?? []),
      );
    });
  }

  /** The spans of each trace, by trace id. */
  traces(): Map<string, Span[]> {
    const traces = new Map<string, Span[]>();
    for (const span of this.spans()) {
      traces.set(span.traceId, [...(traces.get(span.traceId) ?? []), span]);
    }
    return traces;
  }

  /** Everything that left but the key, which goes in its `Authorization` header alone. */
  text(): string {
    return JSON.stringify(
      this.requests.map(({ headers: { Authorization: _, ...headers }, ...request }) => ({
        ...request,
        headers,
      })),
    );
  }
}

export interface Span {
  name: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  attributes: Array<{ key: string; value: Record<string, unknown> }>;
  status?: { code: number };
}

/** A span's attributes as plain values, a count as a number. */
export function attributes(span: Pick<Span, 'attributes'>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const { key, value } of span.attributes)
    out[key] = 'intValue' in value ? Number(value.intValue) : Object.values(value)[0];
  return out;
}

export function startMs(span: Span): number {
  return Number(BigInt(span.startTimeUnixNano) / 1_000_000n);
}

export function endMs(span: Span): number {
  return Number(BigInt(span.endTimeUnixNano) / 1_000_000n);
}

/** Runs the worker in the test's process against `home`, no waits, Telmoni the fake. */
export async function runWorker(
  stop: Stop,
  home: string,
  telmoni: FakeTelmoni,
  env: Record<string, string> = { TELMONI_API_KEY: KEY, TELMONI_ENDPOINT: ENDPOINT },
  extra: Partial<WorkOptions> = {},
): Promise<void> {
  await work(stop, {
    env,
    home,
    hooks: { transport: telmoni.send, sleep: () => Promise.resolve() },
    settleMs: 0,
    settleMaxMs: 0,
    lockWaitMs: 2_000,
    ...extra,
  });
}

/** Everything the plugin keeps on disk: its states, markers and log. */
export function keptText(home: string): string {
  const dir = stateDir(home);
  let names: string[] = [];
  try {
    names = readdirSync(dir);
  } catch {
    return '';
  }
  return names.map((name) => readFileSync(join(dir, name), 'utf8')).join('\n');
}

export function logOf(home: string): string {
  try {
    return readFileSync(join(stateDir(home), 'hook.log'), 'utf8');
  } catch {
    return '';
  }
}

export function stateOf(home: string, id: string = CONVERSATION): Record<string, unknown> {
  return JSON.parse(readFileSync(join(stateDir(home), `${id}.json`), 'utf8')) as Record<
    string,
    unknown
  >;
}
