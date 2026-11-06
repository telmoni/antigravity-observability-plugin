import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const json = (path: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(ROOT, path), 'utf8')) as Record<string, unknown>;

describe('the manifests', () => {
  it('agree on the version, a plain X.Y.Z, which is how Antigravity tells an update', () => {
    const plugin = json('.antigravity-plugin/plugin.json');
    expect(plugin.version).toBe(json('package.json').version);
    expect(plugin.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('give the Marketplace everything it asks for', () => {
    const plugin = json('.antigravity-plugin/plugin.json');
    expect(plugin.name).toBe('telmoni-observability');
    for (const field of [
      'displayName',
      'description',
      'version',
      'logo',
      'suggestedPrompts',
      'author',
    ])
      expect(plugin[field], field).toBeTruthy();
    expect(String(plugin.description).length).toBeLessThanOrEqual(160);
    expect(existsSync(join(ROOT, String(plugin.logo)))).toBe(true);
    // A path with a part starting with `.` is left out of the Marketplace's bundle.
    expect(
      String(plugin.logo)
        .split('/')
        .some((part) => part.startsWith('.')),
    ).toBe(false);
    const prompts = plugin.suggestedPrompts as unknown[];
    expect(prompts.length).toBeGreaterThan(0);
    expect(prompts.length).toBeLessThanOrEqual(3);
    for (const prompt of prompts)
      expect(typeof prompt === 'string' && prompt.trim() !== '').toBe(true);
  });

  it('bring the skill the prompts lean on, named as its folder', () => {
    const text = readFileSync(join(ROOT, 'skills', 'telmoni-observability', 'SKILL.md'), 'utf8');
    const front = /^---\n([\s\S]*?)\n---\n/.exec(text)?.[1] ?? '';
    expect(/^name: (.+)$/m.exec(front)?.[1]).toBe('telmoni-observability');
    const description = /^description: (.+)$/m.exec(front)?.[1] ?? '';
    expect(description.length).toBeGreaterThan(0);
    expect(description.length).toBeLessThanOrEqual(1024);
    expect(Buffer.byteLength(text)).toBeLessThan(24 * 1024);
  });

  it('run a hook whose script is in the repository, from the plugin’s folder', () => {
    const hooks = json('hooks.json') as Record<string, { Stop: Array<{ command: string }> }>;
    const commands = Object.values(hooks).flatMap((hook) =>
      hook.Stop.map((handler) => handler.command),
    );
    expect(commands).toEqual(['node ./dist/hook.mjs']);
  });

  it('ship two files, the hook and its worker, and the hook without the SDK', () => {
    // Splitting would add a file for each dynamic import met, OpenTelemetry's machine-id detectors among them, loaded by nothing.
    expect(readdirSync(join(ROOT, 'dist')).sort()).toEqual(['hook.mjs', 'worker.mjs']);
    // Antigravity waits on the hook before a turn ends: it starts the worker, which alone loads the SDK.
    expect(readFileSync(join(ROOT, 'dist', 'hook.mjs'), 'utf8')).not.toMatch(
      /opentelemetry|telmoni\/sdk/,
    );
  });
});
