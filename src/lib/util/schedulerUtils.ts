import Song from '../Song';
import { ISequenceEvent } from '../data/interface';

/**
 * Returns all ISequenceEvents whose time is in a given time window
 * @param {number} fromTime
 * @param {number} toTime
 * @param {Song} song
 * @param {number} bpm
 * @returns {ISequenceEvent[]}
 */
export function getSequenceEvents(
  fromTime: number,
  toTime: number,
  song: Song,
  bpm: number,
): ISequenceEvent[] {
  const results: ISequenceEvent[] = [];
  for (let ts = 0; ts < song.timedSequences.length; ts++) {
    for (let e = 0; e < song.timedSequences[ts].sequence.events.length; e++) {
      const event: ISequenceEvent = song.timedSequences[ts].sequence.events[e];
      const eventTime = event.absoluteStart.toTime(bpm);
      if (eventTime >= fromTime && eventTime < toTime) {
        results.push(event);
      }
    }
  }

  return results;
}
