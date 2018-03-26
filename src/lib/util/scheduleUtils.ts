import Song from '../Song';
import { IScheduleEventData, ISequenceEvent, ITimedSequence } from '../data/interface';

/**
 * Returns all ISequenceEvents whose time is in a given time window
 * @param {number} fromTime
 * @param {number} toTime
 * @param {Song} song
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
    const timedSequence = song.timedSequences[ts];
    const sequenceStart: number = timedSequence.absoluteStart.toTime(song.bpm);

    // loop through events for sequence
    for (let e = 0; e < timedSequence.sequence.events.length; e++) {
      const event: ISequenceEvent = timedSequence.sequence.events[e];

      // skip if event was already scheduled in a previous call
      if (eventHasBeenScheduled(song, event, timedSequence)) {
        continue;
      }

      // calculate the absolute time for the event
      const absoluteSeconds = sequenceStart + event.relativeStart.toTime(song.bpm);

      // and add to results if it's in the timewindow
      if (absoluteSeconds >= fromTime && absoluteSeconds < toTime) {
        results.push({
          event,
          absoluteSeconds,
        });

        // and mark as scheduled
        markEventAsScheduled(song, event, timedSequence);
      }
    }
  }

  return results;
}

/**
 * Checks if the event was already scheduled in a previous schedule-call
 * @param {Song} song
 * @param {ISequenceEvent} event
 * @param {ITimedSequence} timedSequence
 * @returns {boolean}
 */
function eventHasBeenScheduled(
  song: Song,
  event: ISequenceEvent,
  timedSequence: ITimedSequence,
): boolean {
  if (song.loopPoints.length === 0) {
    // when there are no loop-points, a scheduled event has a value 1 for the id of the timedSequence it is in
    return event.lastScheduledData[timedSequence.id] === 1;
  }
  // todo
  return false;
}

/**
 * Marks the event as scheduled.
 * @param {Song} song
 * @param {ISequenceEvent} event
 * @param {ITimedSequence} timedSequence
 */
function markEventAsScheduled(
  song: Song,
  event: ISequenceEvent,
  timedSequence: ITimedSequence,
): void {
  if (song.loopPoints.length === 0) {
    event.lastScheduledData[timedSequence.id] = 1;
  }

  // todo else
}

export function clearAllLastScheduleData(song: Song): void {
  for (let s = 0; s < song.sequences.length; s++) {
    for (let e = 0; e < song.sequences[s].events.length; e++) {
      song.sequences[s].events[e].lastScheduledData = {};
    }
  }
}
