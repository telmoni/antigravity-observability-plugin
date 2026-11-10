import { utimesSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { stateDir } from '../src/paths.js';
import { traceIdOf } from '../src/record.js';
import { TAGS_FILE } from '../src/shared/tags.js';
import {
  CONVERSATION,
  FakeTelmoni,
  KEY,
  SECRETS,
  T0,
  Transcript,
  assertMetadataOnly,
  attributes,
  endMs,
  keptText,
  logOf,
  makeHome,
  runWorker,
  startMs,
  stateOf,
  writeKeyFile,
} from './helpers.js';

const OTHER = '9f0e8d7c-6b5a-4433-8211-0ffeeddccbba';

describe('the worker', () => {
  it('sends the turn a stop ended: its model calls with their tokens and its tool calls, in the conversation', async () => {
    const home = makeHome();
    const telmoni = new FakeTelmoni();
    const transcript = new Transcript(home);
    transcript.prompt();
    transcript.reply({ tools: ['run_command'], tokens: { input: 100, output: 10, cache: 900 } });
    transcript.wait(2).result();
    transcript.reply({ tokens: { input: 50, output: 5 } });
    await runWorker(transcript.stop({ at: T0 + 7_500 }), home, telmoni);

    const spans = telmoni.spans();
    const agent = spans.find(
      (span) => attributes(span)['gen_ai.operation.name'] === 'invoke_agent',
    );
    expect(agent?.name).toBe('invoke_agent antigravity');
    expect(agent?.traceId).toBe(traceIdOf(CONVERSATION, 0));
    expect(attributes(agent!)).toMatchObject({ 'gen_ai.conversation.id': CONVERSATION });
    expect([startMs(agent!), endMs(agent!)]).toEqual([T0, T0 + 7_500]);
    const chats = spans
      .filter((span) => attributes(span)['gen_ai.operation.name'] === 'chat')
      .map(attributes);
    expect(chats).toEqual([
      expect.objectContaining({
        'gen_ai.request.model': 'gemini-3.8-flash',
        'gen_ai.provider.name': 'gcp.vertex_ai',
        'gen_ai.request.reasoning.level': 'low',
        'gen_ai.usage.input_tokens': 1000,
        'gen_ai.usage.output_tokens': 10,
        'gen_ai.usage.cache_read.input_tokens': 900,
      }),
      expect.objectContaining({ 'gen_ai.usage.input_tokens': 50, 'gen_ai.usage.output_tokens': 5 }),
    ]);
    expect(
      spans
        .filter((span) => attributes(span)['gen_ai.operation.name'] === 'execute_tool')
        .map((span) => span.name),
    ).toEqual(['execute_tool run_command']);
    expect(telmoni.requests[0]?.headers.Authorization).toBe(`Bearer ${KEY}`);
    expect(logOf(home)).toContain(`sent ${traceIdOf(CONVERSATION, 0).slice(0, 8)}`);
  });

  it('sends nothing anyone said, nor any path, with content off: not to Telmoni, not to its state, not to its log', async () => {
    const home = makeHome();
    const telmoni = new FakeTelmoni();
    telmoni.mode = 'on';
    const transcript = new Transcript(home);
    transcript.prompt();
    transcript.reply({ tools: ['run_command', 'view_file'] });
    transcript.result();
    transcript.result({ type: 'VIEW_FILE' });
    transcript.checkpoint({ input: 10, output: 10 });
    transcript.system();
    transcript.error(429);
    transcript.reply();
    await runWorker(transcript.stop({ reason: 'ERROR', error: SECRETS.error }), home, telmoni);
    expect(telmoni.spans().length).toBeGreaterThan(0);
    for (const text of [telmoni.text(), keptText(home)])
      assertMetadataOnly(text, [transcript.path, transcript.workspace, home]);
  });

  it('sends the conversation only where both the switch and the project’s content mode are on', async () => {
    for (const [mode, sent] of [
      ['on', true],
      ['off', false],
    ] as const) {
      const home = makeHome();
      const telmoni = new FakeTelmoni();
      telmoni.mode = mode;
      const transcript = new Transcript(home);
      transcript.turn(['run_command']);
      await runWorker(transcript.stop(), home, telmoni, {
        TELMONI_API_KEY: KEY,
        TELMONI_CAPTURE_CONTENT: '1',
      });
      expect(telmoni.text().includes(SECRETS.prompt), `content mode ${mode}`).toBe(sent);
      expect(telmoni.text().includes(SECRETS.output), `content mode ${mode}`).toBe(sent);
      // Never what Antigravity wraps the prompt in, nor its system's own words.
      for (const never of [
        SECRETS.metadata,
        SECRETS.system,
        SECRETS.lastUserInput,
        SECRETS.finalModelOutput,
        transcript.path,
      ])
        expect(telmoni.text()).not.toContain(never);
    }
  });

  it('holds a turn while a background task runs, and sends it, to its end, at the stop that finds the conversation idle', async () => {
    const home = makeHome();
    const telmoni = new FakeTelmoni();
    const transcript = new Transcript(home);
    transcript.turn(['run_command']);
    await runWorker(transcript.stop({ idle: false }), home, telmoni);
    expect(telmoni.spans()).toEqual([]);
    expect(logOf(home)).toContain(
      `held ${traceIdOf(CONVERSATION, 0).slice(0, 8)}: its turn is not over yet`,
    );
    transcript.wait(30).reply();
    const later = transcript.now + 400;
    await runWorker(transcript.stop({ at: later }), home, telmoni);
    const agent = telmoni.spans().find((span) => span.name === 'invoke_agent antigravity');
    expect(endMs(agent!)).toBe(later);
  });

  it('sends each turn once, however many stops it hears', async () => {
    const home = makeHome();
    const telmoni = new FakeTelmoni();
    const transcript = new Transcript(home);
    transcript.turn([]);
    const stop = transcript.stop();
    await runWorker(stop, home, telmoni);
    await runWorker(stop, home, telmoni);
    transcript.turn(['view_file']);
    await runWorker(transcript.stop(), home, telmoni);
    expect([...telmoni.traces().keys()]).toEqual([
      traceIdOf(CONVERSATION, 0),
      traceIdOf(CONVERSATION, 2),
    ]);
  });

  it('records a conversation from the turn its first stop ended: the history before stays home', async () => {
    const home = makeHome();
    const telmoni = new FakeTelmoni();
    const transcript = new Transcript(home);
    transcript.turn(['run_command']);
    transcript.turn(['view_file']);
    transcript.turn([]);
    await runWorker(transcript.stop(), home, telmoni);
    expect([...telmoni.traces().keys()]).toEqual([traceIdOf(CONVERSATION, 8)]);
  });

  it('sends the turn a stop ended though the next prompt landed before the worker read, and holds that one', async () => {
    const home = makeHome();
    const telmoni = new FakeTelmoni();
    const transcript = new Transcript(home);
    transcript.turn([]);
    const stop = transcript.stop();
    transcript.wait(3).prompt();
    transcript.reply({ tools: ['run_command'] });
    await runWorker(stop, home, telmoni);
    expect([...telmoni.traces().keys()]).toEqual([traceIdOf(CONVERSATION, 0)]);
    expect(stateOf(home).cursor).toBe(2);
  });

  it('holds, never skips, a prompt queued as the stop ended, and sends it at its own stop', async () => {
    const home = makeHome();
    const telmoni = new FakeTelmoni();
    const transcript = new Transcript(home);
    transcript.turn(['run_command']);
    const stop = transcript.stop({ at: transcript.now + 300 });
    transcript.prompt();
    await runWorker(stop, home, telmoni);
    expect([...telmoni.traces().keys()]).toEqual([traceIdOf(CONVERSATION, 0)]);
    transcript.reply({ tools: ['view_file'] });
    transcript.result();
    transcript.reply();
    await runWorker(transcript.stop(), home, telmoni);
    expect([...telmoni.traces().keys()]).toEqual([
      traceIdOf(CONVERSATION, 0),
      traceIdOf(CONVERSATION, 4),
    ]);
  });

  it('keeps a turn Telmoni could not take and sends it first at the next stop, the later turn behind it', async () => {
    const home = makeHome();
    const telmoni = new FakeTelmoni();
    const transcript = new Transcript(home);
    transcript.turn([]);
    telmoni.offline = true;
    await runWorker(transcript.stop(), home, telmoni);
    expect(stateOf(home).pending).toHaveLength(1);
    expect(logOf(home)).toContain(`kept ${traceIdOf(CONVERSATION, 0).slice(0, 8)}`);

    transcript.turn([]);
    await runWorker(transcript.stop(), home, telmoni);
    expect(stateOf(home).pending).toHaveLength(2);

    telmoni.offline = false;
    transcript.turn([]);
    await runWorker(transcript.stop(), home, telmoni);
    expect([...telmoni.traces().keys()]).toEqual(
      [0, 2, 4].map((prompt) => traceIdOf(CONVERSATION, prompt)),
    );
    expect(stateOf(home).pending).toEqual([]);
  });

  it('drops a turn kept in a shape no longer sent, says so, and sends the next', async () => {
    const home = makeHome();
    const telmoni = new FakeTelmoni();
    const transcript = new Transcript(home);
    transcript.turn([]);
    telmoni.offline = true;
    await runWorker(transcript.stop(), home, telmoni);
    const state = stateOf(home);
    const [kept] = state.pending as Record<string, unknown>[];
    const { traceId, ...old } = kept!;
    writeFileSync(
      join(stateDir(home), `${CONVERSATION}.json`),
      JSON.stringify({ ...state, pending: [{ ...old, runId: traceId }] }),
    );

    telmoni.offline = false;
    transcript.turn([]);
    await runWorker(transcript.stop(), home, telmoni);
    expect(logOf(home)).toContain('dropped 1 kept in a shape no longer sent');
    expect([...telmoni.traces().keys()]).toEqual([traceIdOf(CONVERSATION, 2)]);
    expect(stateOf(home).pending).toEqual([]);
  });

  it('does not keep a turn Telmoni refused for good', async () => {
    const home = makeHome();
    const telmoni = new FakeTelmoni();
    telmoni.answers = [{ status: 400, body: { code: 3, message: '/errors/request/invalid: no' } }];
    const transcript = new Transcript(home);
    transcript.turn([]);
    await runWorker(transcript.stop(), home, telmoni);
    expect(stateOf(home).pending).toEqual([]);
    expect(logOf(home)).toContain('refused, not sent again');
  });

  it('sends what another conversation kept, where it was meant for the same key and endpoint', async () => {
    const home = makeHome();
    const telmoni = new FakeTelmoni();
    const left = new Transcript(home, OTHER);
    left.turn([]);
    telmoni.offline = true;
    await runWorker(left.stop(), home, telmoni);
    // Another key's kept turns go nowhere they were not meant to.
    const elsewhere = new Transcript(home, 'aaaaaaaa-0000-4000-8000-000000000001');
    elsewhere.turn([]);
    await runWorker(elsewhere.stop(), home, telmoni, { TELMONI_API_KEY: 'tm_another_key' });
    telmoni.offline = false;

    const transcript = new Transcript(home);
    transcript.turn([]);
    await runWorker(transcript.stop(), home, telmoni);
    expect(new Set(telmoni.traces().keys())).toEqual(
      new Set([traceIdOf(CONVERSATION, 0), traceIdOf(OTHER, 0)]),
    );
    expect(stateOf(home, OTHER).pending).toEqual([]);
    expect(stateOf(home, 'aaaaaaaa-0000-4000-8000-000000000001').pending).toHaveLength(1);
  });

  it('sends nothing, and says so once, where there is no key', async () => {
    const home = makeHome();
    const telmoni = new FakeTelmoni();
    const transcript = new Transcript(home);
    transcript.turn([]);
    await runWorker(transcript.stop(), home, telmoni, {});
    transcript.turn([]);
    await runWorker(transcript.stop(), home, telmoni, {});
    expect(telmoni.requests).toEqual([]);
    expect(logOf(home).match(/no key/g)).toHaveLength(1);
    // Once a key is set, the conversation is recorded from that stop on.
    transcript.turn([]);
    await runWorker(transcript.stop(), home, telmoni);
    expect([...telmoni.traces().keys()]).toEqual([traceIdOf(CONVERSATION, 4)]);
  });

  it('reads the key file while it is the person’s own and shut to everyone else, with its endpoint and switches', async () => {
    const home = makeHome();
    const telmoni = new FakeTelmoni();
    writeKeyFile(home, { apiKey: KEY, endpoint: 'https://telmoni.example.com' });
    const transcript = new Transcript(home);
    transcript.turn([]);
    await runWorker(transcript.stop(), home, telmoni, {});
    expect(telmoni.requests[0]?.url).toMatch(/^https:\/\/telmoni\.example\.com\//);
    expect(telmoni.requests[0]?.headers.Authorization).toBe(`Bearer ${KEY}`);
  });

  it.skipIf(process.platform === 'win32')(
    'sends nothing where the key file is open to others, and says why',
    async () => {
      const home = makeHome();
      const telmoni = new FakeTelmoni();
      writeKeyFile(home, { apiKey: KEY }, 0o644);
      const transcript = new Transcript(home);
      transcript.turn([]);
      await runWorker(transcript.stop(), home, telmoni, {});
      expect(telmoni.requests).toEqual([]);
      expect(logOf(home)).toContain('key file not read: open to other users; chmod 600 it');
    },
  );

  it('takes a key in the environment over the file, never with the file’s endpoint', async () => {
    const home = makeHome();
    const telmoni = new FakeTelmoni();
    writeKeyFile(home, { apiKey: 'tm_file_key', endpoint: 'https://file.example.com' });
    const transcript = new Transcript(home);
    transcript.turn([]);
    await runWorker(transcript.stop(), home, telmoni);
    expect(telmoni.requests[0]?.url).toMatch(/^https:\/\/api\.telmoni\.com\//);
    expect(telmoni.requests[0]?.headers.Authorization).toBe(`Bearer ${KEY}`);
  });

  it('puts the workspace’s tags on the trace, never its path', async () => {
    const home = makeHome();
    const telmoni = new FakeTelmoni();
    const transcript = new Transcript(home);
    writeFileSync(
      join(transcript.workspace, TAGS_FILE),
      JSON.stringify({ repo: 'telmoni', branch: 'main', 'bad key': 'x' }),
    );
    transcript.turn([]);
    await runWorker(transcript.stop(), home, telmoni);
    const agent = telmoni.spans().find((span) => span.name === 'invoke_agent antigravity');
    expect(attributes(agent!)).toMatchObject({
      'telmoni.tag.repo': 'telmoni',
      'telmoni.tag.branch': 'main',
    });
    expect(logOf(home)).toContain('tag dropped');
    assertMetadataOnly(telmoni.text() + keptText(home), [transcript.workspace]);
  });

  it('leaves a state it cannot read as it is, and sends nothing', async () => {
    const home = makeHome();
    const telmoni = new FakeTelmoni();
    const transcript = new Transcript(home);
    transcript.turn([]);
    await runWorker(transcript.stop(), home, telmoni);
    const path = join(stateDir(home), `${CONVERSATION}.json`);
    writeFileSync(path, '{not json');
    transcript.turn([]);
    await runWorker(transcript.stop(), home, telmoni);
    expect(telmoni.traces().size).toBe(1);
    expect(logOf(home)).toContain('state unreadable');
  });

  it('leaves a conversation another hook is at work on to that hook', async () => {
    const home = makeHome();
    const telmoni = new FakeTelmoni();
    const transcript = new Transcript(home);
    transcript.turn([]);
    await runWorker(transcript.stop(), home, telmoni);
    const lock = join(stateDir(home), `${CONVERSATION}.lock`);
    writeFileSync(lock, 'another');
    const now = new Date();
    utimesSync(lock, now, now);
    transcript.turn([]);
    await runWorker(transcript.stop(), home, telmoni, undefined, { lockWaitMs: 50 });
    expect(telmoni.traces().size).toBe(1);
    expect(logOf(home)).toContain('another hook holds the conversation');
  });
});
