import Song from '../Song';
import { IScheduleEventData, ISection, ISequenceEvent, ITimedSequence } from '../data/interface';

/**
 * Returns all ISequenceEvents whose time is in a given time window
 * @param {number} fromTime
 * @param {number} toTime
 * @param {Song} song
 * @param {ISection} currentSection
 * @returns {ISequenceEvent[]}
 */
export function getEventScheduleList(
  song: Song,
  fromTime: number,
  toTime: number,
  currentSection: ISection,
): IScheduleEventData[] {
  if (song.getSections().length === 0) {
    if (currentSection) {
      throw new Error('Song has no sections but there is a current section set');
    }

    return getEventScheduleListForNonSectionSong(fromTime, toTime, song);
  }

  if (!currentSection) {
    throw new Error('Song has sections but there is no current section');
  }

  return getEventScheduleListForSectionSong(fromTime, toTime, song, currentSection);
}

function getEventScheduleListForSectionSong(
  fromTime: number,
  toTime: number,
  song: Song,
  currentSection: ISection,
): IScheduleEventData[] {
  console.time('schedule');
  const results: IScheduleEventData[] = [];

  /*tslint:disable*/
  let section = currentSection;
  let sectionIteration = getSectionIterationAtTime(section, fromTime, song.bpm);
  let fromTimeInSection = fromTime - section.startedAt;
  /*tslint:enable*/
  console.log(`section "${section.start.toString()}"`, sectionIteration, fromTimeInSection);
  console.log('from', fromTime, 'to', toTime);
  let counter = 0;
  while (counter < 1) {
    song.timedSequences.forEach(timedSequence => {
      timedSequence.sequence.events.forEach(event => {
        const eventStart = event.relativeStart.add(timedSequence.absoluteStart).toTime(song.bpm);
        if (eventStart < fromTime) {
          // event is in the past todo half events still count here
        } else if (eventStart >= fromTime && eventStart < toTime) {
          // event start is in window
          results.push({
            event,
            absoluteSeconds: eventStart,
          });
        } else {
          console.log('skip');
        }
      });
      // if (timedSequence.absoluteStart.toTime(song.bpm) > toTime) {
      //   console.log('skip');
      // }
    });

    counter++;
  }

  console.timeEnd('schedule');
  return results;
}

/**
 * Returns the iteration for a section (when looping).
 * @param {ISection} section
 * @param {number} time
 * @param {number} bpm
 * @returns {number}
 */
export function getSectionIterationAtTime(section: ISection, time: number, bpm: number): number {
  if (typeof section.startedAt === void 0) {
    throw new Error(
      `Section (${section.start.toString()}-${section.end.toString()}) has no 'startedAt' value, cannot get iteration`,
    );
  }
  const sectionStartedAt = section.startedAt;
  const sectionLength = section.end.toTime(bpm) - section.start.toTime(bpm);
  return Math.floor((time - sectionStartedAt) / sectionLength);
}

/**
 * Returns events in the given timewindow for a song without sections.
 * @param {number} fromTime
 * @param {number} toTime
 * @param {Song} song
 * @returns {IScheduleEventData[]}
 */
function getEventScheduleListForNonSectionSong(
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
 * So we can read and write the same value
 * @type {number}
 */
const nonSectionSongMarkedValue = 1;

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
  if (song.getSections().length === 0) {
    // when there are no loop-points, a scheduled event has a value 1 for the id of the timedSequence it is in
    return event.lastScheduledData[timedSequence.id] === nonSectionSongMarkedValue;
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
  if (song.getSections().length === 0) {
    event.lastScheduledData[timedSequence.id] = nonSectionSongMarkedValue;
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
