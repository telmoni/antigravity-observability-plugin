import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { type Row, readTranscript, typedPrompt } from '../src/transcript.js';
import { mkfifoSync } from './fifo.js';
import { SECRETS, T0, Transcript, assertMetadataOnly, makeHome } from './helpers.js';

function rows(path: string, content = false): Row[] {
  const read = readTranscript(path, { content });
  if ('problem' in read) throw new Error(read.problem);
  return read.rows;
}

/** The rows without where they were written, which their own test proves. */
function placeless(path: string, content = false): Array<Omit<Row, 'offset'>> {
  return rows(path, content).map(({ offset: _, ...row }) => row);
}

describe('the transcript', () => {
  it('reads each step’s kind, time, tokens, tools and codes', () => {
    const transcript = new Transcript(makeHome());
    transcript.prompt();
    transcript.reply({
      tools: ['run_command', 'view_file'],
      tokens: { input: 10, output: 20, cache: 30 },
    });
    transcript.result({ type: 'RUN_COMMAND', exitCode: 2 });
    transcript.error(429);
    expect(placeless(transcript.path)).toEqual([
      { index: 0, type: 'USER_INPUT', source: 'USER_EXPLICIT', status: 'DONE', at: T0, tools: [] },
      {
        index: 1,
        type: 'PLANNER_RESPONSE',
        source: 'MODEL',
        status: 'DONE',
        at: T0 + 1000,
        usage: { input: 10, output: 20, cacheRead: 30 },
        tools: [{ name: 'run_command' }, { name: 'view_file' }],
      },
      {
        index: 2,
        type: 'RUN_COMMAND',
        source: 'MODEL',
        status: 'DONE',
        at: T0 + 2000,
        tools: [],
        exitCode: 2,
      },
      {
        index: 3,
        type: 'ERROR_MESSAGE',
        source: 'SYSTEM',
        status: 'DONE',
        at: T0 + 3000,
        tools: [],
        errorCode: 429,
      },
    ]);
  });

  it('reads nothing anyone said unless content is asked for', () => {
    const transcript = new Transcript(makeHome());
    transcript.turn(['run_command']);
    transcript.checkpoint();
    transcript.system();
    transcript.error(503);
    assertMetadataOnly(JSON.stringify(rows(transcript.path)));
  });

  it('with content, reads the prompt as typed, the reply, its reasoning, the tools’ arguments and output', () => {
    const transcript = new Transcript(makeHome());
    transcript.turn(['run_command']);
    const [prompt, call, result, reply] = rows(transcript.path, true);
    expect(prompt?.text).toBe(SECRETS.prompt);
    expect(call?.tools[0]?.args).toEqual({ CommandLine: SECRETS.args, toolSummary: SECRETS.args });
    expect(call?.thinking).toBe(SECRETS.thinking);
    expect(result?.text).toContain(SECRETS.output);
    expect(reply?.text).toBe(SECRETS.reply);
    // The metadata Antigravity wraps a prompt in, which may name the person's folders, never.
    expect(JSON.stringify(prompt)).not.toContain(SECRETS.metadata);
  });

  it('orders steps by their index, as Antigravity writes a reply after its results', () => {
    const transcript = new Transcript(makeHome());
    transcript.prompt();
    transcript.reply({ tools: ['view_file', 'view_file'] });
    transcript.result();
    transcript.result();
    transcript.write([0, 2, 3, 1]);
    expect(rows(transcript.path).map((row) => row.index)).toEqual([0, 1, 2, 3]);
  });

  it('keeps the last line written for a step, and passes over a line half written or not a step', () => {
    const transcript = new Transcript(makeHome());
    transcript.prompt();
    transcript.result({ status: 'RUNNING' });
    appendFileSync(
      transcript.path,
      `${JSON.stringify({ ...transcript.rows[1], status: 'DONE' })}\n`,
    );
    appendFileSync(transcript.path, '{"step_index": 2, "type": "PLANNER_RESP');
    appendFileSync(
      transcript.path,
      '\n[1, 2]\n{"type": "GENERIC"}\n{"step_index": -1, "type": "X"}\n',
    );
    expect(rows(transcript.path).map((row) => [row.index, row.status])).toEqual([
      [0, 'DONE'],
      [1, 'DONE'],
    ]);
  });

  it('reads a field of another type as none', () => {
    const home = makeHome();
    const path = join(home, 't.jsonl');
    writeFileSync(
      path,
      `${JSON.stringify({ step_index: 0, type: 'PLANNER_RESPONSE', created_at: 'yesterday', input_tokens: -1, output_tokens: 1.5, cache_read_tokens: '3', tool_calls: [{ name: 7 }, 'x'], exit_code: 'one', error_code: '503' })}\n`,
    );
    expect(rows(path)).toEqual([
      {
        index: 0,
        offset: 0,
        type: 'PLANNER_RESPONSE',
        source: undefined,
        status: undefined,
        at: undefined,
        tools: [{ name: undefined }, { name: undefined }],
        errorCode: 503,
      },
    ]);
  });

  it('knows where in the file each step was first written, in bytes, a rewritten step keeping its place', () => {
    const transcript = new Transcript(makeHome());
    transcript.prompt('ünïcödé ✓');
    transcript.result({ status: 'RUNNING' });
    const lines = readFileSync(transcript.path);
    appendFileSync(
      transcript.path,
      `${JSON.stringify({ ...transcript.rows[1], status: 'DONE' })}\n`,
    );
    const second = lines.indexOf(0x0a) + 1;
    expect(rows(transcript.path).map((row) => [row.offset, row.status])).toEqual([
      [0, 'DONE'],
      [second, 'DONE'],
    ]);
  });

  it('reads a time that names no zone as UTC', () => {
    const home = makeHome();
    const path = join(home, 't.jsonl');
    writeFileSync(
      path,
      `${JSON.stringify({ step_index: 0, type: 'USER_INPUT', created_at: '2026-11-05T22:00:00' })}\n`,
    );
    expect(rows(path)[0]?.at).toBe(T0);
  });

  it('says why where there is no transcript to read', () => {
    const home = makeHome();
    expect(readTranscript(join(home, 'missing.jsonl'), { content: false })).toEqual({
      problem: 'no transcript yet',
    });
    mkdirSync(join(home, 'folder.jsonl'));
    expect(readTranscript(join(home, 'folder.jsonl'), { content: false })).toEqual({
      problem: 'transcript not a file',
    });
  });

  it.skipIf(process.platform === 'win32')('never waits on a pipe in the transcript’s place', () => {
    const home = makeHome();
    const path = join(home, 'pipe.jsonl');
    mkfifoSync(path);
    expect(readTranscript(path, { content: false })).toEqual({ problem: 'transcript not a file' });
  });
});

describe('the prompt as typed', () => {
  it('is the request alone', () => {
    expect(
      typedPrompt(
        '<USER_REQUEST>\nfix it\n</USER_REQUEST>\n<ADDITIONAL_METADATA>\n/home/x\n</ADDITIONAL_METADATA>',
      ),
    ).toBe('fix it');
  });

  it('is what comes before Antigravity’s own blocks where there is no request', () => {
    expect(typedPrompt('fix it\n<ADDITIONAL_METADATA>\n/home/x\n</ADDITIONAL_METADATA>')).toBe(
      'fix it',
    );
    expect(typedPrompt('<ADDITIONAL_METADATA>\n/home/x\n</ADDITIONAL_METADATA>')).toBeUndefined();
    expect(typedPrompt('<USER_REQUEST>\n\n</USER_REQUEST>')).toBeUndefined();
  });
});
