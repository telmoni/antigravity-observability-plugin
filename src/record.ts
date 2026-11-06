/**
 * A turn as a run: its model calls with their tokens, its tool calls and its compactions, each timed from the step that
 * began it to the next, and with content on, the conversation as the GenAI conventions' messages.
 */

import { createHash } from 'node:crypto';

import type {
  CallRecord,
  ModelCallRecord,
  RecordOutcome,
  RunRecord,
  StepRecord,
  ToolCallRecord,
} from 'telmoni';

import { errorKind, modelOf, toolName } from './names.js';
import { COMPACTION, ERROR_MESSAGE, MODEL_CALL, type Row } from './transcript.js';
import type { Turn } from './turns.js';

export const AGENT = 'antigravity';
/** Antigravity's models run on Google Cloud, whose price table names each of them under Vertex AI. */
export const PROVIDER = 'gcp.vertex_ai';

/** How the stop that ended a turn said it ended. */
export interface Ending {
  at: number;
  reason?: string;
  errored?: boolean;
}

export interface RecordOptions {
  conversationId: string;
  /** The model the stop named, which Antigravity's transcript names for no step. */
  modelName: string | undefined;
  ending: Ending | undefined;
  content: boolean;
}

const NAMESPACE_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

/** A version 5 UUID (RFC 9562) of `name` under `namespace`. */
function uuid5(name: string, namespace: string): string {
  const digest = createHash('sha1')
    .update(Buffer.from(namespace.replaceAll('-', ''), 'hex'))
    .update(name)
    .digest();
  digest[6] = ((digest[6] ?? 0) & 0x0f) | 0x50;
  digest[8] = ((digest[8] ?? 0) & 0x3f) | 0x80;
  const hex = digest.subarray(0, 16).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const NAMESPACE = uuid5('https://telmoni.com/antigravity-observability-plugin', NAMESPACE_URL);

/** The run's id, the same however often its turn is built, so a turn sent twice is stored once. */
export function runIdOf(conversationId: string, prompt: number): string {
  return uuid5(`${conversationId}:${prompt}`, NAMESPACE);
}

/** A tool's result: a step the model's source wrote that is neither a reply nor an error. */
function isResult(row: Row): boolean {
  return row.source === 'MODEL' && row.type !== MODEL_CALL && row.type !== ERROR_MESSAGE;
}

type Message = { role: string; parts: Array<Record<string, unknown>> };

function text(role: string, content: string | undefined): Message[] | undefined {
  return content === undefined ? undefined : [{ role, parts: [{ type: 'text', content }] }];
}

/** The run for `turn`, or undefined for a turn with no call in it or no time to place it at. */
export function recordTurn(turn: Turn, options: RecordOptions): RunRecord | undefined {
  const { rows } = turn;
  const known = rows.map((row) => row.at).filter((at): at is number => at !== undefined);
  const start = turn.open.at ?? known[0] ?? options.ending?.at;
  if (start === undefined) return undefined;
  const end = Math.max(start, ...known, options.ending?.at ?? start);
  // Each step lasts until the next one begins; the last until the turn's end.
  const until = (i: number): number => {
    const from = rows[i]?.at ?? start;
    const next = rows.slice(i + 1).find((row) => row.at !== undefined)?.at ?? end;
    return Math.max(from, next);
  };
  const { model, effort } = modelOf(options.modelName);
  const modelCall = (row: Row, i: number): ModelCallRecord => {
    const call: ModelCallRecord = {
      type: 'model_call',
      model,
      provider: PROVIDER,
      start: row.at ?? start,
      end: until(i),
    };
    if (effort !== undefined) call.reasoningEffort = effort;
    const usage = row.usage;
    if (usage !== undefined) {
      // As the conventions count it: the input with the cache's reads, which Antigravity's own count leaves out.
      call.usage = {};
      if (usage.input !== undefined) call.usage.inputTokens = usage.input + (usage.cacheRead ?? 0);
      if (usage.output !== undefined) call.usage.outputTokens = usage.output;
      if (usage.cacheRead !== undefined) call.usage.cacheReadInputTokens = usage.cacheRead;
    }
    return call;
  };

  const inside: Array<StepRecord | CallRecord> = [];
  let lastReply: Row | undefined;
  let lastError: Row | undefined;
  let sinceCall: Row[] = [];
  let calls = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] as Row;
    if (row.type === MODEL_CALL) {
      const call = modelCall(row, i);
      if (options.content) {
        const given = calls === 0 ? text('user', turn.open.text) : toolMessages(sinceCall);
        if (given !== undefined) call.inputMessages = given;
        const said = replyParts(row);
        if (said.length > 0) call.outputMessages = [{ role: 'assistant', parts: said }];
      }
      inside.push(call);
      calls += 1;
      sinceCall = [];
      lastReply = row;
      lastError = undefined;
      // Its tool calls are answered by the results that follow, in order, until the next reply.
      const results: number[] = [];
      for (let j = i + 1; j < rows.length && rows[j]?.type !== MODEL_CALL; j++) {
        if (isResult(rows[j] as Row)) results.push(j);
      }
      const answered = results.at(row.tools.length - 1) ?? results.at(-1);
      // Where the turn moved on without the rest.
      const movedOn = answered === undefined ? call.end : until(answered);
      row.tools.forEach((tool, k) => {
        const at = results[k];
        const result = at === undefined ? undefined : rows[at];
        const record: ToolCallRecord =
          at === undefined || result === undefined
            ? // Never answered: refused, or the turn stopped first.
              {
                type: 'tool_call',
                name: toolName(tool.name),
                start: movedOn,
                end: movedOn,
                cancelled: true,
              }
            : {
                type: 'tool_call',
                name: toolName(tool.name),
                start: result.at ?? call.end,
                end: until(at),
                ...failure(result),
              };
        if (options.content) {
          if (tool.args !== undefined) record.arguments = tool.args;
          if (result?.text !== undefined) record.result = result.text;
        }
        inside.push(record);
      });
    } else if (row.type === ERROR_MESSAGE) {
      inside.push({ ...modelCall(row, i), errorType: errorKind(row.errorCode) });
      lastError = row;
    } else if (row.type === COMPACTION) {
      const step: StepRecord = {
        type: 'step',
        name: 'compaction',
        start: row.at ?? start,
        end: until(i),
      };
      // The summary's own model call, where Antigravity counted its tokens.
      if (row.usage !== undefined) step.calls = [modelCall(row, i)];
      if (options.content && row.text !== undefined)
        step.outputMessages = text('assistant', row.text);
      inside.push(step);
    } else if (isResult(row)) {
      sinceCall.push(row);
    }
  }
  if (inside.length === 0) return undefined;

  const record: RunRecord = {
    runId: runIdOf(options.conversationId, turn.open.index),
    agent: AGENT,
    sessionId: options.conversationId,
    start,
    end,
    // Ordered by start, the run's own times holding every call.
    inside: inside.sort((a, b) => Number(a.start) - Number(b.start)),
    ...outcome(rows, options.ending, lastError),
  };
  if (options.content) {
    const input = text('user', turn.open.text);
    if (input !== undefined) record.inputMessages = input;
    const output = text('assistant', lastReply?.text);
    if (output !== undefined) record.outputMessages = output;
  }
  return record;
}

/** A result's failure: an error, or a command's exit code where Antigravity records one. */
function failure(result: Row): RecordOutcome {
  if (result.status === 'ERROR') return { errorType: 'ToolError' };
  if (result.exitCode !== undefined && result.exitCode !== 0) return { errorType: 'ToolError' };
  return {};
}

/**
 * The run's outcome: cancelled where the person stopped it; failed by an error's kind, or by the limit it hit, where
 * the stop says so; else failed only where the turn's last call is an error, as when its stop was never heard.
 */
function outcome(
  rows: readonly Row[],
  ending: Ending | undefined,
  lastError: Row | undefined,
): RecordOutcome {
  const reason = ending?.reason;
  if (reason === 'USER_CANCELED') return { cancelled: true };
  if (reason === 'ERROR' || ending?.errored === true) {
    const error = rows.findLast((row) => row.type === ERROR_MESSAGE);
    return { errorType: error === undefined ? 'AgentError' : errorKind(error.errorCode) };
  }
  if (reason?.startsWith('MAX_') === true) return { errorType: reason.toLowerCase() };
  if (reason === undefined && lastError !== undefined)
    return { errorType: errorKind(lastError.errorCode) };
  return {};
}

/** What a reply said: its reasoning in plain text, its words, and the tools it called with their arguments. */
function replyParts(row: Row): Array<Record<string, unknown>> {
  const parts: Array<Record<string, unknown>> = [];
  if (row.thinking !== undefined) parts.push({ type: 'reasoning', content: row.thinking });
  if (row.text !== undefined) parts.push({ type: 'text', content: row.text });
  for (const tool of row.tools) {
    const call: Record<string, unknown> = { type: 'tool_call', name: toolName(tool.name) };
    if (tool.args !== undefined) call.arguments = tool.args;
    parts.push(call);
  }
  return parts;
}

/** The tools' results since the call before, together one `tool` message, as the next call is handed them. */
function toolMessages(results: readonly Row[]): Message[] | undefined {
  const parts = results
    .filter((row) => row.text !== undefined)
    .map((row) => ({ type: 'tool_call_response', response: row.text }));
  return parts.length > 0 ? [{ role: 'tool', parts }] : undefined;
}
