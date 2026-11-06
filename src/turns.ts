/**
 * A conversation's turns: each from a prompt the person gave to the next, and when one can no longer change.
 */

import type { Stop } from './payload.js';
import { type Row, USER_INPUT } from './transcript.js';

export interface Turn {
  /** The prompt that opened it. */
  open: Row;
  /** Every step after the prompt and before the next, in step order. */
  rows: Row[];
  /** Whether a later prompt follows it, which ends it whatever its stop said. */
  followed: boolean;
}

/** The conversation's turns in order; the steps before its first prompt open none. */
export function cut(rows: readonly Row[]): Turn[] {
  const turns: Turn[] = [];
  for (const row of rows) {
    if (row.type === USER_INPUT) {
      const before = turns.at(-1);
      if (before !== undefined) before.followed = true;
      turns.push({ open: row, rows: [], followed: false });
    } else {
      turns.at(-1)?.rows.push(row);
    }
  }
  return turns;
}

/**
 * The turn a stop ended: the last opened by then, since a prompt given after the hook ran, as a queued one is at once,
 * opens one still at work. By where its prompt was written, inside the transcript as the hook found it; by time where
 * the hook found none, though a time to the second cannot tell a prompt queued in the stop's second.
 */
export function endedBy(turns: readonly Turn[], stop: Pick<Stop, 'at' | 'size'>): Turn | undefined {
  const { size } = stop;
  if (size !== undefined) return turns.findLast((turn) => turn.open.offset < size);
  return turns.findLast((turn) => turn.open.at === undefined || turn.open.at <= stop.at);
}

/** Whether nothing more can come of a turn: a prompt follows it, or this stop ended it with no background task left. */
export function isComplete(turn: Turn, ended: Turn | undefined, stop: Pick<Stop, 'idle'>): boolean {
  return turn.followed || (turn === ended && stop.idle);
}

/** The step a cursor moves to once a turn is done with: the next prompt's, else past the turn's last step. */
export function after(turn: Turn): number {
  return (turn.rows.at(-1) ?? turn.open).index + 1;
}
