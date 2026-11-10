import type { ModelCallRecord, StepRecord, ToolCallRecord, TraceRecord } from 'telmoni';
import { describe, expect, it } from 'vitest';

import { type Ending, PROVIDER, recordTurn, traceIdOf } from '../src/record.js';
import { readTranscript } from '../src/transcript.js';
import { cut } from '../src/turns.js';
import { CONVERSATION, SECRETS, T0, Transcript, assertMetadataOnly, makeHome } from './helpers.js';

function record(
  transcript: Transcript,
  options: { ending?: Ending; content?: boolean; model?: string; turn?: number } = {},
): TraceRecord | undefined {
  const content = options.content ?? false;
  const read = readTranscript(transcript.path, { content });
  if ('problem' in read) throw new Error(read.problem);
  const turn = cut(read.rows)[options.turn ?? 0];
  if (turn === undefined) throw new Error('no turn');
  return recordTurn(turn, {
    conversationId: CONVERSATION,
    modelName: options.model ?? 'gemini-3.8-flash-low',
    ending: options.ending,
    content,
  });
}

const calls = (trace: TraceRecord | undefined) =>
  (trace?.inside ?? []) as Array<ModelCallRecord | ToolCallRecord | StepRecord>;
const models = (trace: TraceRecord | undefined) =>
  calls(trace).filter((call): call is ModelCallRecord => call.type === 'model_call');
const tools = (trace: TraceRecord | undefined) =>
  calls(trace).filter((call): call is ToolCallRecord => call.type === 'tool_call');

describe('a turn as a trace', () => {
  it('is a trace of the agent antigravity in the conversation, from the prompt to the stop', () => {
    const transcript = new Transcript(makeHome());
    transcript.turn(['run_command']);
    const trace = record(transcript, { ending: { at: T0 + 9500 } });
    expect(trace).toMatchObject({
      traceId: traceIdOf(CONVERSATION, 0),
      agent: 'antigravity',
      sessionId: CONVERSATION,
      start: T0,
      end: T0 + 9500,
    });
    expect(trace?.errorType).toBeUndefined();
    expect(trace?.cancelled).toBeUndefined();
  });

  it('times each step from its start to the next’s, the last to the stop', () => {
    const transcript = new Transcript(makeHome());
    transcript.prompt();
    transcript.reply({ tools: ['run_command'] });
    transcript.wait(2).result();
    transcript.wait(3).reply();
    const trace = record(transcript, { ending: { at: T0 + 12_000 } });
    expect(
      calls(trace).map((call) => [call.type, Number(call.start) - T0, Number(call.end) - T0]),
    ).toEqual([
      ['model_call', 1000, 4000],
      ['tool_call', 4000, 8000],
      ['model_call', 8000, 12_000],
    ]);
  });

  it('names each model call by the stop’s model, its effort apart, with Antigravity’s tokens as the conventions count them', () => {
    const transcript = new Transcript(makeHome());
    transcript.prompt();
    transcript.reply({ tokens: { input: 100, output: 20, cache: 900 } });
    expect(models(record(transcript, { model: 'claude-opus-5-5-high' }))).toEqual([
      expect.objectContaining({
        model: 'claude-opus-5-5',
        provider: PROVIDER,
        reasoningEffort: 'high',
        usage: { inputTokens: 1000, outputTokens: 20, cacheReadInputTokens: 900 },
      }),
    ]);
  });

  it('pairs each tool call with its result in order; one never answered is cancelled', () => {
    const transcript = new Transcript(makeHome());
    transcript.prompt();
    transcript.reply({ tools: ['view_file', 'run_command', 'grep_search'] });
    transcript.result({ type: 'VIEW_FILE' });
    transcript.result({ type: 'RUN_COMMAND', exitCode: 1 });
    transcript.reply();
    const trace = record(transcript);
    expect(tools(trace).map((tool) => [tool.name, tool.errorType, tool.cancelled])).toEqual([
      ['view_file', undefined, undefined],
      ['run_command', 'ToolError', undefined],
      ['grep_search', undefined, true],
    ]);
  });

  it('fails a tool call whose result is an error, and leaves one still running in the background as it was', () => {
    const transcript = new Transcript(makeHome());
    transcript.prompt();
    transcript.reply({ tools: ['run_command', 'run_command'] });
    transcript.result({ status: 'ERROR' });
    transcript.result({ status: 'RUNNING' });
    transcript.reply();
    expect(tools(record(transcript)).map((tool) => [tool.errorType, tool.cancelled])).toEqual([
      ['ToolError', undefined],
      [undefined, undefined],
    ]);
  });

  it('records an API error as a failed model call, named by its code', () => {
    const transcript = new Transcript(makeHome());
    transcript.prompt();
    transcript.error(429);
    transcript.reply();
    expect(models(record(transcript)).map((call) => call.errorType)).toEqual([
      'rate_limit',
      undefined,
    ]);
  });

  it('records a compaction as a step holding its model call', () => {
    const transcript = new Transcript(makeHome());
    transcript.prompt();
    transcript.reply({ tools: ['view_file'] });
    transcript.result();
    transcript.checkpoint({ input: 5000, output: 300 });
    transcript.reply();
    const step = calls(record(transcript)).find((call): call is StepRecord => call.type === 'step');
    expect(step).toMatchObject({ name: 'compaction', start: T0 + 3000, end: T0 + 4000 });
    expect(step?.calls).toEqual([
      expect.objectContaining({
        type: 'model_call',
        usage: { inputTokens: 5000, outputTokens: 300, cacheReadInputTokens: 0 },
      }),
    ]);
  });

  it.each([
    ['USER_CANCELED', undefined, { cancelled: true }],
    ['MAX_INVOCATIONS', undefined, { errorType: 'max_invocations' }],
    ['ERROR', 503, { errorType: 'server_error' }],
    ['ERROR', undefined, { errorType: 'AgentError' }],
  ])('ends a trace stopped by %s as it says', (reason, code, outcome) => {
    const transcript = new Transcript(makeHome());
    transcript.prompt();
    transcript.reply({ tools: ['run_command'] });
    if (code !== undefined) transcript.error(code);
    const trace = record(transcript, { ending: { at: transcript.now, reason } });
    expect({ errorType: trace?.errorType, cancelled: trace?.cancelled }).toEqual({
      errorType: undefined,
      cancelled: undefined,
      ...outcome,
    });
  });

  it('fails a trace whose last call is an error where no stop said how it ended', () => {
    const transcript = new Transcript(makeHome());
    transcript.prompt();
    transcript.reply({ tools: ['run_command'] });
    transcript.result();
    transcript.error(503);
    expect(record(transcript)?.errorType).toBe('server_error');
  });

  it('is no trace where the turn made no call', () => {
    const transcript = new Transcript(makeHome());
    transcript.prompt();
    transcript.system();
    expect(record(transcript)).toBeUndefined();
  });

  it('is the same trace however often its turn is built', () => {
    const transcript = new Transcript(makeHome());
    transcript.turn(['run_command', 'view_file']);
    expect(JSON.stringify(record(transcript, { ending: { at: T0 + 9000 } }))).toBe(
      JSON.stringify(record(transcript, { ending: { at: T0 + 9000 } })),
    );
    // A version 5 UUID's bytes as a trace id: 32 hex digits, no hyphens.
    expect(traceIdOf(CONVERSATION, 0)).toMatch(/^[0-9a-f]{12}5[0-9a-f]{3}[89ab][0-9a-f]{15}$/);
    expect(traceIdOf(CONVERSATION, 0)).not.toBe(traceIdOf(CONVERSATION, 5));
  });

  it('holds nothing anyone said with content off', () => {
    const transcript = new Transcript(makeHome());
    transcript.turn(['run_command', 'view_file']);
    transcript.checkpoint({ input: 1, output: 1 });
    transcript.error(500);
    transcript.reply();
    assertMetadataOnly(
      JSON.stringify(
        record(transcript, { ending: { at: transcript.now, reason: 'ERROR', errored: true } }),
      ),
    );
  });

  it('with content on, carries the conversation as the GenAI conventions’ messages', () => {
    const transcript = new Transcript(makeHome());
    transcript.prompt();
    transcript.reply({ tools: ['run_command'] });
    transcript.result();
    transcript.system();
    transcript.checkpoint();
    transcript.reply();
    const trace = record(transcript, { content: true });
    expect(trace?.inputMessages).toEqual([
      { role: 'user', parts: [{ type: 'text', content: SECRETS.prompt }] },
    ]);
    expect(trace?.outputMessages).toEqual([
      { role: 'assistant', parts: [{ type: 'text', content: SECRETS.reply }] },
    ]);
    const [first, second] = models(trace);
    expect(first?.inputMessages).toEqual(trace?.inputMessages);
    expect(first?.outputMessages).toEqual([
      {
        role: 'assistant',
        parts: [
          { type: 'reasoning', content: SECRETS.thinking },
          {
            type: 'tool_call',
            name: 'run_command',
            arguments: { CommandLine: SECRETS.args, toolSummary: SECRETS.args },
          },
        ],
      },
    ]);
    // Handed what is new to it: the tool's result, never the system's own message.
    expect(second?.inputMessages).toEqual([
      {
        role: 'tool',
        parts: [{ type: 'tool_call_response', response: expect.stringContaining(SECRETS.output) }],
      },
    ]);
    expect(tools(trace)[0]).toMatchObject({
      arguments: { CommandLine: SECRETS.args },
      result: expect.stringContaining(SECRETS.output),
    });
    const step = calls(trace).find((call): call is StepRecord => call.type === 'step');
    expect(step?.outputMessages).toEqual([
      { role: 'assistant', parts: [{ type: 'text', content: SECRETS.summary }] },
    ]);
    const text = JSON.stringify(trace);
    for (const never of [SECRETS.metadata, SECRETS.system, SECRETS.error, SECRETS.workspace])
      expect(text).not.toContain(never);
  });
});
