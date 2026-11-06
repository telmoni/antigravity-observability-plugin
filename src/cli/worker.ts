/** The worker the hook starts, detached: the stop on its stdin, the work in `../worker.ts`. */

import { readFileSync } from 'node:fs';

import { takeOver } from '../payload.js';
import { work } from '../worker.js';

let text = '';
try {
  text = readFileSync(0, 'utf8');
} catch {
  // Nothing handed over.
}
const stop = takeOver(text);
if (stop !== undefined) await work(stop, { env: process.env });
process.exit(0);
