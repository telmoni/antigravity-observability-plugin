import { describe, expect, it } from 'vitest';

import { errorKind, modelOf, toolName } from '../src/names.js';

describe('names', () => {
  it.each([
    ['gemini-3.8-flash-low', { model: 'gemini-3.8-flash', effort: 'low' }],
    ['claude-opus-5-5-high', { model: 'claude-opus-5-5', effort: 'high' }],
    ['gpt-oss-120b-medium', { model: 'gpt-oss-120b', effort: 'medium' }],
    ['gemini-4-argon', { model: 'gemini-4-argon' }],
    ['auto', { model: 'auto' }],
    ['Gemini 3.1 Pro (High)', { model: 'Gemini 3.1 Pro (High)' }],
    [undefined, { model: 'unknown' }],
    ['/home/someone/models/weights.gguf', { model: 'unknown' }],
    ['gemini\u0000', { model: 'unknown' }],
  ])('names the model %j as %j', (given, named) => {
    expect(modelOf(given)).toEqual(named);
  });

  it('cuts a model’s name to 128 characters', () => {
    expect(modelOf('m'.repeat(200)).model).toHaveLength(128);
  });

  it.each([
    ['run_command', 'run_command'],
    ['mcp:server@tool+x.y-z', 'mcp:server@tool+x.y-z'],
    ['run command', 'unknown'],
    ['view_file\nrm -rf', 'unknown'],
    [undefined, 'unknown'],
  ])('names the tool %j as %j', (given, named) => {
    expect(toolName(given)).toBe(named);
  });

  it.each([
    [429, 'rate_limit'],
    [503, 'server_error'],
    [500, 'server_error'],
    [404, 'http_404'],
    [undefined, 'ApiError'],
    [7, 'ApiError'],
  ])('names the error %j as %j', (code, kind) => {
    expect(errorKind(code)).toBe(kind);
  });
});
