/**
 * What the hook keeps of Antigravity's `Stop`: the conversation, its transcript and how the turn ended. Never the
 * prompt (`lastUserInput`), the last answer (`finalModelOutput`), an error's words or the artifacts' folder.
 */

import { isAbsolute } from 'node:path';

import { isFileId } from './shared/state.js';

export interface Stop {
  conversationId: string;
  /** Where Antigravity writes the conversation, read by the worker alone. */
  transcriptPath: string;
  /** The first workspace folder, read only to find `.telmoni-tags.json`: never kept, sent or logged. */
  workspace?: string;
  /** The model Antigravity names for the conversation, as it names it (`gemini-3.8-flash-low`). */
  modelName?: string;
  /** Why the loop stopped, Antigravity's `terminationReason` (`NO_TOOL_CALL`, `USER_CANCELED`, `ERROR`, …). */
  reason?: string;
  /** Whether the stop named an error: only that it did. */
  errored: boolean;
  /** Whether every background task had finished too; a stop that says not leaves its turn open. */
  idle: boolean;
  /** When the hook ran, in milliseconds since the epoch: the end of the turn that stopped. */
  at: number;
  /** The transcript's size as the hook ran: a prompt written past it, such as one queued, opened a turn still at work. */
  size?: number;
}

const REASON = /^[A-Z][A-Z0-9_]{0,63}$/;
/** Longer than any model's name: a field this long is not one. */
const MODEL_MAX = 256;

/** The stop as the hook hands it to the worker, on its stdin: never its arguments, which others on the machine can read. */
export function handOff(stop: Stop): string {
  return JSON.stringify(stop);
}

/** The stop the hook handed over, held to the same rules, or undefined for anything else on stdin. */
export function takeOver(text: string): Stop | undefined {
  let given: unknown;
  try {
    given = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (given === null || typeof given !== 'object' || Array.isArray(given)) return undefined;
  const { at, idle, errored, workspace, reason, size } = given as Record<string, unknown>;
  if (typeof at !== 'number' || !Number.isFinite(at)) return undefined;
  const stop = readStop(
    {
      ...given,
      workspacePaths: [workspace],
      terminationReason: reason,
      error: errored === true ? 'error' : '',
      fullyIdle: idle !== false,
    },
    at,
  );
  if (stop !== undefined && typeof size === 'number' && Number.isSafeInteger(size) && size >= 0)
    stop.size = size;
  return stop;
}

/** The stop as the worker needs it, or undefined where the payload names no conversation or transcript to read. */
export function readStop(payload: unknown, at: number): Stop | undefined {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return undefined;
  const given = payload as Record<string, unknown>;
  const { conversationId, transcriptPath } = given;
  if (!isFileId(conversationId)) return undefined;
  if (
    typeof transcriptPath !== 'string' ||
    !isAbsolute(transcriptPath) ||
    !transcriptPath.endsWith('.jsonl')
  )
    return undefined;
  const stop: Stop = {
    conversationId,
    transcriptPath,
    errored: typeof given.error === 'string' && given.error.trim() !== '',
    // `false` alone holds the turn: Antigravity before the field never said, and its stop was the turn's end.
    idle: given.fullyIdle !== false,
    at,
  };
  const workspaces = Array.isArray(given.workspacePaths) ? given.workspacePaths : [];
  const workspace = workspaces.find(
    (path): path is string => typeof path === 'string' && isAbsolute(path),
  );
  if (workspace !== undefined) stop.workspace = workspace;
  const model = typeof given.modelName === 'string' ? given.modelName.trim() : '';
  if (model !== '' && model.length <= MODEL_MAX) stop.modelName = model;
  if (typeof given.terminationReason === 'string' && REASON.test(given.terminationReason))
    stop.reason = given.terminationReason;
  return stop;
}
