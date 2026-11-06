/**
 * Where the plugin keeps what it needs: Antigravity gives a hook no folder of its own, so the key file and the plugin's
 * folder sit in Antigravity's shared configuration folder, which the agent's own tools may not read.
 */

import { homedir } from 'node:os';
import { join } from 'node:path';

/** `~/.gemini/config`, which the CLI, the App and the IDE share. */
export function configDir(home: string = homedir()): string {
  return join(home, '.gemini', 'config');
}

/** `{"apiKey": "tm_…"}`, read only while it is the person's own and shut to everyone else. */
export function keyFile(home?: string): string {
  return join(configDir(home), 'telmoni.json');
}

/** The plugin's own folder: each conversation's state and lock, and `hook.log`. */
export function stateDir(home?: string): string {
  return join(configDir(home), 'telmoni');
}
