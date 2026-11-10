import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { type Server, createServer } from 'node:http';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { stateDir } from '../src/paths.js';
import { traceIdOf } from '../src/record.js';
import {
  CONVERSATION,
  KEY,
  SECRETS,
  Transcript,
  assertMetadataOnly,
  keptText,
  makeHome,
} from './helpers.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const HOOK = join(ROOT, 'dist', 'hook.mjs');

/** Runs the hook as Antigravity does: `node ./dist/hook.mjs` in the plugin's folder, the payload on stdin. */
function runHook(
  input: string,
  env: Record<string, string>,
): { status: number | null; stdout: string; ms: number } {
  const started = Date.now();
  const result = spawnSync(process.execPath, ['./dist/hook.mjs'], {
    cwd: ROOT,
    input,
    env: { PATH: process.env.PATH ?? '', ...env },
    encoding: 'utf8',
    timeout: 10_000,
  });
  return { status: result.status, stdout: result.stdout, ms: Date.now() - started };
}

async function until(done: () => boolean, ms = 15_000): Promise<boolean> {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    if (done()) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return done();
}

let server: Server | undefined;

afterEach(() => {
  server?.close();
  server = undefined;
});

/** Telmoni's ingest on this machine, keeping each export's body. */
async function telmoni(): Promise<{ endpoint: string; bodies: string[] }> {
  const bodies: string[] = [];
  server = createServer((request, response) => {
    let body = '';
    request.on('data', (chunk: Buffer) => (body += chunk.toString('utf8')));
    request.on('end', () => {
      bodies.push(body);
      response.writeHead(200, {
        'Content-Type': 'application/json',
        'Telmoni-Content-Mode': 'off',
      });
      response.end('{"partialSuccess":null}');
    });
  });
  await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (address === null || typeof address === 'string') throw new Error('no port');
  return { endpoint: `http://127.0.0.1:${address.port}`, bodies };
}

describe('the hook, as Antigravity runs it', () => {
  beforeAll(() => {
    expect(existsSync(HOOK), 'npm run build first').toBe(true);
  });

  it.each(['', 'not json', '[]', '{}', JSON.stringify({ conversationId: CONVERSATION })])(
    'answers {} and exits 0 for %j',
    (input) => {
      const home = makeHome();
      const result = runHook(input, { HOME: home, USERPROFILE: home });
      expect(result.status).toBe(0);
      expect(JSON.parse(result.stdout)).toEqual({});
    },
  );

  it('hands the stop to its worker and returns at once; the worker sends the turn', async () => {
    const home = makeHome();
    const { endpoint, bodies } = await telmoni();
    const transcript = new Transcript(home);
    transcript.turn(['run_command']);
    const result = runHook(JSON.stringify(transcript.stopPayload()), {
      HOME: home,
      USERPROFILE: home,
      TELMONI_API_KEY: KEY,
      TELMONI_ENDPOINT: endpoint,
    });
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({});
    // Before the worker's own settle wait is up: the hook never waits on it.
    expect(result.ms).toBeLessThan(2_000);
    expect(
      await until(() => bodies.some((body) => body.includes(traceIdOf(CONVERSATION, 0)))),
    ).toBe(true);
    const state = join(stateDir(home), `${CONVERSATION}.json`);
    expect(
      await until(
        () =>
          existsSync(state) &&
          (JSON.parse(readFileSync(state, 'utf8')) as { sent: string[] }).sent.length === 1,
      ),
    ).toBe(true);
    assertMetadataOnly(bodies.join('\n') + keptText(home), [transcript.path, transcript.workspace]);
  });

  it('starts a worker that says, once, that there is no key', async () => {
    const home = makeHome();
    const transcript = new Transcript(home);
    transcript.turn([]);
    const result = runHook(JSON.stringify(transcript.stopPayload()), {
      HOME: home,
      USERPROFILE: home,
    });
    expect(result.status).toBe(0);
    const log = join(stateDir(home), 'hook.log');
    expect(await until(() => existsSync(log) && readFileSync(log, 'utf8').includes('no key'))).toBe(
      true,
    );
    expect(readFileSync(log, 'utf8')).not.toContain(SECRETS.lastUserInput);
  });
});
