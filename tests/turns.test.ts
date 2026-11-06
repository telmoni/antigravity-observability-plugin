import { describe, expect, it } from 'vitest';

import { readTranscript } from '../src/transcript.js';
import { after, cut, endedBy, isComplete } from '../src/turns.js';
import { Transcript, makeHome } from './helpers.js';

function turnsOf(transcript: Transcript) {
  const read = readTranscript(transcript.path, { content: false });
  if ('problem' in read) throw new Error(read.problem);
  return cut(read.rows);
}

describe('turns', () => {
  it('open at each prompt and hold every step until the next', () => {
    const transcript = new Transcript(makeHome());
    transcript.system();
    transcript.turn(['run_command']);
    transcript.turn([]);
    const turns = turnsOf(transcript);
    expect(
      turns.map((turn) => [turn.open.index, turn.rows.map((row) => row.index), turn.followed]),
    ).toEqual([
      [1, [2, 3, 4], true],
      [5, [6], false],
    ]);
    expect(turns.map(after)).toEqual([5, 7]);
  });

  it('end at the stop that came after their prompt, and a prompt after the stop opens one still at work', () => {
    const transcript = new Transcript(makeHome());
    transcript.turn([]);
    const stop = transcript.stop();
    transcript.wait(5).prompt();
    const turns = turnsOf(transcript);
    const ended = endedBy(turns, stop);
    expect(ended).toBe(turns[0]);
    expect(isComplete(turns[0]!, ended, stop)).toBe(true);
    expect(isComplete(turns[1]!, ended, stop)).toBe(false);
  });

  it('tell a prompt queued in the stop’s own second by where it was written', () => {
    const transcript = new Transcript(makeHome());
    transcript.turn([]);
    // Queued while the agent worked, the prompt lands as the stop ends: its time, to the second, is the stop's.
    const stop = transcript.stop({ at: transcript.now + 300 });
    transcript.prompt();
    const turns = turnsOf(transcript);
    expect(turns[1]?.open.at).toBeLessThanOrEqual(stop.at);
    expect(endedBy(turns, stop)).toBe(turns[0]);
    // A hook that found no transcript goes by time.
    const { size: _, ...timed } = stop;
    expect(endedBy(turns, timed)).toBe(turns[1]);
  });

  it('are not over while a background task is, unless the person spoke again', () => {
    const transcript = new Transcript(makeHome());
    transcript.turn([]);
    const busy = transcript.stop({ idle: false });
    let turns = turnsOf(transcript);
    expect(isComplete(turns[0]!, endedBy(turns, busy), busy)).toBe(false);
    transcript.turn([]);
    turns = turnsOf(transcript);
    expect(isComplete(turns[0]!, endedBy(turns, busy), busy)).toBe(true);
  });
});
