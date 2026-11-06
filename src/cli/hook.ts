/**
 * Antigravity's `Stop` hook. Antigravity waits on its hooks before the turn ends, so this hands the stop to a worker of
 * its own, detached, and answers at once; it loads no SDK, and nothing it meets fails the turn.
 */

import { spawn } from 'node:child_process';
import { closeSync, openSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { handOff, readStop, type Stop } from '../payload.js';
import { stateDir } from '../paths.js';
import { ensurePrivateDir } from '../shared/state.js';

/** Past this, a payload is not one this plugin reads: the prompt and the last answer ride in it. */
const MAX_INPUT_BYTES = 64 * 1024 * 1024;
/** The longest the hook waits for the worker to take the stop. */
const HANDOFF_MS = 2_000;

async function input(): Promise<string> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of process.stdin as AsyncIterable<Buffer>) {
    size += chunk.length;
    if (size > MAX_INPUT_BYTES) return '';
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

/** Starts the worker on its own, the stop on its stdin, its errors in the log; resolves once it has the stop. */
function start(stop: Stop): Promise<void> {
  const dir = stateDir();
  let cwd = tmpdir();
  let errors: number | 'ignore' = 'ignore';
  try {
    ensurePrivateDir(dir);
    // Out of the plugin's folder, which an update replaces.
    cwd = dir;
    errors = openSync(join(dir, 'hook.log'), 'a', 0o600);
  } catch {
    // The worker logs nothing then; it still sends.
  }
  return new Promise((resolve) => {
    const done = (): void => {
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(done, HANDOFF_MS);
    try {
      const worker = fileURLToPath(new URL('./worker.mjs', import.meta.url));
      const child = spawn(process.execPath, [worker], {
        cwd,
        detached: true,
        stdio: ['pipe', 'ignore', errors],
        windowsHide: true,
      });
      child.on('error', done);
      child.stdin?.on('error', done);
      child.stdin?.end(handOff(stop), done);
      child.unref();
    } catch {
      done();
    } finally {
      if (typeof errors === 'number') closeSync(errors);
    }
  });
}

try {
  const at = Date.now();
  const stop = readStop(JSON.parse(await input()), at);
  if (stop !== undefined) {
    try {
      stop.size = statSync(stop.transcriptPath).size;
    } catch {
      // No transcript yet: the worker goes by time.
    }
    await start(stop);
  }
} catch {
  // No payload to read, or no worker to start: the turn ends as it would have.
}
// Antigravity reads a JSON object; one with no decision lets the stop go on.
process.stdout.write('{}\n');
