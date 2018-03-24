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
export function getEventScheduleList(
  fromTime: number,
  toTime: number,
  song: Song,
): IScheduleEventData[] {
  const results: IScheduleEventData[] = [];
  for (let ts = 0; ts < song.timedSequences.length; ts++) {
    // start time for this sequence
    const sequenceStart = song.timedSequences[ts].absoluteStart.toTime(song.bpm);

    // loop through events for sequence todo musictime needs to be able to cache
    for (let e = 0; e < song.timedSequences[ts].sequence.events.length; e++) {
      const event: ISequenceEvent = song.timedSequences[ts].sequence.events[e];

      // calculate the absolute time for the event
      const absoluteSeconds = sequenceStart + event.relativeStart.toTime(song.bpm);

      // and add to results
      if (absoluteSeconds >= fromTime && absoluteSeconds < toTime) {
        results.push({
          event,
          absoluteSeconds,
        });
      }
    }
  }

  return results;
}

export interface IScheduleEventData {
  event: ISequenceEvent;
  absoluteSeconds: number;
}
