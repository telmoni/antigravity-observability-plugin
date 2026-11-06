import { describe, expect, it } from 'vitest';

import { handOff, readStop, takeOver } from '../src/payload.js';
import { SECRETS, Transcript, makeHome } from './helpers.js';

describe('the Stop payload', () => {
  it('keeps the conversation, the transcript, the model and how the turn ended', () => {
    const transcript = new Transcript(makeHome());
    const stop = readStop(transcript.stopPayload({ reason: 'USER_CANCELED', idle: false }), 1234);
    expect(stop).toEqual({
      conversationId: transcript.conversationId,
      transcriptPath: transcript.path,
      workspace: transcript.workspace,
      modelName: 'gemini-3.8-flash-low',
      reason: 'USER_CANCELED',
      errored: false,
      idle: false,
      at: 1234,
    });
  });

  it('never keeps the prompt, the last answer, an error’s words or the artifacts’ folder', () => {
    const transcript = new Transcript(makeHome());
    const stop = readStop(transcript.stopPayload({ error: SECRETS.error }), 1);
    expect(stop?.errored).toBe(true);
    const handed = handOff(stop!);
    for (const secret of [
      SECRETS.lastUserInput,
      SECRETS.finalModelOutput,
      SECRETS.error,
      SECRETS.artifacts,
    ])
      expect(handed).not.toContain(secret);
  });

  it('holds the turn only where fullyIdle is false', () => {
    const transcript = new Transcript(makeHome());
    const { fullyIdle: _, ...older } = transcript.stopPayload();
    expect(readStop(older, 1)?.idle).toBe(true);
    expect(readStop({ ...older, fullyIdle: false }, 1)?.idle).toBe(false);
  });

  it.each([
    ['no conversation', { conversationId: undefined }],
    ['a conversation id that is no plain id', { conversationId: '../escape' }],
    ['a relative transcript path', { transcriptPath: 'transcript_full.jsonl' }],
    ['a transcript that is no JSON Lines', { transcriptPath: '/tmp/transcript.txt' }],
  ])('does nothing with %s', (_, change) => {
    const transcript = new Transcript(makeHome());
    expect(readStop({ ...transcript.stopPayload(), ...change }, 1)).toBeUndefined();
  });

  it.each([null, [], 'text', 42])('does nothing with %j', (payload) => {
    expect(readStop(payload, 1)).toBeUndefined();
  });

  it('drops a termination reason that is no plain word, and a model name too long to be one', () => {
    const transcript = new Transcript(makeHome());
    const stop = readStop(
      {
        ...transcript.stopPayload(),
        terminationReason: 'no reason at all',
        modelName: 'm'.repeat(300),
      },
      1,
    );
    expect(stop?.reason).toBeUndefined();
    expect(stop?.modelName).toBeUndefined();
  });

  it('hands the worker the same stop it kept, and nothing else', () => {
    const transcript = new Transcript(makeHome());
    const stop = transcript.stop({ reason: 'ERROR', error: SECRETS.error, idle: false });
    expect(takeOver(handOff(stop))).toEqual(stop);
    expect(takeOver('not json')).toBeUndefined();
    expect(takeOver(JSON.stringify({ ...stop, at: 'now' }))).toBeUndefined();
  });
});
