/**
 * What a record may call a model or a tool: a plain name within ingest's caps, never text a model wrote by mistake.
 */

/** A control character, or half of a character, which no name holds. */
const NOT_TEXT = /[\u0000-\u001f\u007f-\u009f]|\p{Cs}/u;
/** Antigravity's model ids end in the effort the model was asked for: `gemini-3.8-flash-low`, `claude-opus-5-5-high`. */
const EFFORT = /^([a-z0-9][a-z0-9._-]*?)-(minimal|low|medium|high|xhigh|max)$/i;
const MODEL_MAX = 128;
const TOOL = /^[A-Za-z0-9_.:@+-]+$/;
const TOOL_MAX = 145;

export interface ModelName {
  model: string;
  /** How hard it was asked to reason, which is metadata, sent in every mode. */
  effort?: string;
}

/** The model Antigravity names, its effort apart, so the model is the one the price table names. */
export function modelOf(given: string | undefined): ModelName {
  if (given === undefined || given === '' || NOT_TEXT.test(given)) return { model: 'unknown' };
  // A path is no model's name, and may hold a person's folders.
  if (/[\\/]/.test(given)) return { model: 'unknown' };
  const split = EFFORT.exec(given);
  if (split?.[1] !== undefined && split[2] !== undefined)
    return { model: split[1].slice(0, MODEL_MAX), effort: split[2].toLowerCase() };
  return { model: given.slice(0, MODEL_MAX) };
}

/** A tool's name as the model called it, or `unknown` for one holding anything a tool's name does not. */
export function toolName(given: string | undefined): string {
  return given !== undefined && TOOL.test(given) ? given.slice(0, TOOL_MAX) : 'unknown';
}

/** An error's code as its kind: never its message, which may hold anything the session said. */
export function errorKind(code: number | undefined): string {
  if (code === 429) return 'rate_limit';
  if (code !== undefined && code >= 500 && code <= 599) return 'server_error';
  if (code !== undefined && code >= 400 && code <= 499) return `http_${code}`;
  return 'ApiError';
}
