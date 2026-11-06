/**
 * Antigravity's transcript of a conversation (`brain/<id>/.system_generated/logs/transcript_full.jsonl`): a JSON object
 * a line for each step. Every field the plugin reads is read here, and the conversation itself only where asked.
 */

import { closeSync, constants, fstatSync, openSync, readFileSync } from 'node:fs';

/** A reply's tokens as Antigravity counts them: its input leaves out what was read from the cache. */
export interface RowUsage {
  input?: number;
  output?: number;
  cacheRead?: number;
}

export interface ToolUse {
  /** As the model wrote it; held to a plain name before it is sent. */
  name: string | undefined;
  /** Content: the arguments, read only where asked. */
  args?: unknown;
}

export interface Row {
  /** `step_index`: the step's place in the conversation, which orders rows written out of turn. */
  index: number;
  /** Where in the file the step was first written, in bytes. */
  offset: number;
  /** `USER_INPUT`, `PLANNER_RESPONSE` (a model call), a tool's result (`RUN_COMMAND`, `VIEW_FILE`, `GENERIC`, …), … */
  type: string;
  /** `USER_EXPLICIT`, `MODEL` or `SYSTEM`. */
  source: string | undefined;
  /** `DONE`, `RUNNING` (a command left at work in the background) or `ERROR`. */
  status: string | undefined;
  /** `created_at`, as the step began, to the second. */
  at: number | undefined;
  usage?: RowUsage;
  tools: ToolUse[];
  /** A command's exit code, where Antigravity records it. */
  exitCode?: number;
  /** An error's code (`429`, `503`), never its message. */
  errorCode?: number;
  /** Content, read only where asked: a prompt as the person typed it, a reply, a tool's output, a compaction's summary. */
  text?: string;
  /** Content: a reply's reasoning, as Antigravity wrote it in plain text. */
  thinking?: string;
}

export const USER_INPUT = 'USER_INPUT';
export const MODEL_CALL = 'PLANNER_RESPONSE';
export const ERROR_MESSAGE = 'ERROR_MESSAGE';
export const COMPACTION = 'CHECKPOINT';

/** A transcript past this is read as none: the worker reads it whole, every hook. */
export const MAX_TRANSCRIPT_BYTES = 256 * 1024 * 1024;

export type TranscriptRead = { rows: Row[] } | { problem: string };

/**
 * The transcript's rows in step order, each step once, the last line written for it winning; a line that is not a JSON
 * object with a step and a type, as a line half written is, is passed over.
 */
export function readTranscript(path: string, options: { content: boolean }): TranscriptRead {
  let bytes: Buffer;
  try {
    // Never waiting on a pipe put in its place.
    const fd = openSync(path, constants.O_RDONLY | constants.O_NONBLOCK);
    try {
      const stat = fstatSync(fd);
      if (!stat.isFile()) return { problem: 'transcript not a file' };
      if (stat.size > MAX_TRANSCRIPT_BYTES) return { problem: 'transcript past 256 MiB' };
      bytes = readFileSync(fd);
    } finally {
      closeSync(fd);
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return { problem: code === 'ENOENT' ? 'no transcript yet' : 'transcript unreadable' };
  }
  const byIndex = new Map<number, Row>();
  for (let start = 0; start < bytes.length;) {
    const newline = bytes.indexOf(0x0a, start);
    const end = newline === -1 ? bytes.length : newline;
    const line = bytes.toString('utf8', start, end);
    const offset = start;
    start = end + 1;
    if (line.trim() === '') continue;
    let value: unknown;
    try {
      value = JSON.parse(line);
    } catch {
      continue;
    }
    const row = readRow(value, offset, options.content);
    if (row === undefined) continue;
    const first = byIndex.get(row.index);
    if (first !== undefined) row.offset = first.offset;
    byIndex.set(row.index, row);
  }
  return { rows: [...byIndex.values()].sort((a, b) => a.index - b.index) };
}

function readRow(value: unknown, offset: number, content: boolean): Row | undefined {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const data = value as Record<string, unknown>;
  const index = data.step_index;
  if (typeof index !== 'number' || !Number.isSafeInteger(index) || index < 0) return undefined;
  if (typeof data.type !== 'string' || data.type === '') return undefined;
  const row: Row = {
    index,
    offset,
    type: data.type,
    source: typeof data.source === 'string' ? data.source : undefined,
    status: typeof data.status === 'string' ? data.status : undefined,
    at: timeOf(data.created_at),
    tools: toolsOf(data.tool_calls, content),
  };
  const usage = usageOf(data);
  if (usage !== undefined) row.usage = usage;
  const exitCode = integer(data.exit_code);
  if (exitCode !== undefined) row.exitCode = exitCode;
  const errorCode = integer(data.error_code);
  if (errorCode !== undefined) row.errorCode = errorCode;
  if (content) {
    const said =
      typeof data.content === 'string' && data.content.trim() !== '' ? data.content : undefined;
    const text = said !== undefined && row.type === USER_INPUT ? typedPrompt(said) : said;
    if (text !== undefined && text !== '') row.text = text;
    if (typeof data.thinking === 'string' && data.thinking.trim() !== '')
      row.thinking = data.thinking;
  }
  return row;
}

/** `created_at` in milliseconds; one naming no zone is read as UTC, as Antigravity writes it. */
function timeOf(given: unknown): number | undefined {
  if (typeof given !== 'string' || given === '') return undefined;
  const zoned = /(?:Z|[+-]\d\d:?\d\d)$/i.test(given) ? given : `${given}Z`;
  const ms = Date.parse(zoned);
  return Number.isFinite(ms) ? ms : undefined;
}

function count(given: unknown): number | undefined {
  return typeof given === 'number' && Number.isSafeInteger(given) && given >= 0 ? given : undefined;
}

/** An integer, or one written as decimal digits. */
function integer(given: unknown): number | undefined {
  if (typeof given === 'number' && Number.isSafeInteger(given)) return given;
  if (typeof given === 'string' && /^-?\d{1,9}$/.test(given)) return Number(given);
  return undefined;
}

function usageOf(data: Record<string, unknown>): RowUsage | undefined {
  const usage: RowUsage = {};
  const input = count(data.input_tokens);
  const output = count(data.output_tokens);
  const cacheRead = count(data.cache_read_tokens);
  if (input !== undefined) usage.input = input;
  if (output !== undefined) usage.output = output;
  if (cacheRead !== undefined) usage.cacheRead = cacheRead;
  return Object.keys(usage).length > 0 ? usage : undefined;
}

function toolsOf(given: unknown, content: boolean): ToolUse[] {
  if (!Array.isArray(given)) return [];
  return given.map((call: unknown) => {
    const data =
      call !== null && typeof call === 'object' && !Array.isArray(call)
        ? (call as Record<string, unknown>)
        : {};
    const tool: ToolUse = { name: typeof data.name === 'string' ? data.name : undefined };
    if (content && data.args !== undefined) tool.args = data.args;
    return tool;
  });
}

/**
 * What the person typed, out of the prompt Antigravity wraps it in: the `<USER_REQUEST>` alone, never the metadata
 * beside it (the local time, a setting changed, the files open).
 */
export function typedPrompt(content: string): string | undefined {
  const request = /<USER_REQUEST>\n?([\s\S]*?)\n?<\/USER_REQUEST>/.exec(content);
  if (request !== null) return request[1]?.trim() || undefined;
  // No wrapper: whatever comes before any block of Antigravity's own.
  const own = content.search(/<[A-Z][A-Z_]+>/);
  const typed = (own === -1 ? content : content.slice(0, own)).trim();
  return typed === '' ? undefined : typed;
}
