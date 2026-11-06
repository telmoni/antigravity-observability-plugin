import { execFileSync } from 'node:child_process';

/** Makes a named pipe at `path`, which Node cannot make itself. */
export function mkfifoSync(path: string): void {
  execFileSync('mkfifo', [path]);
}
