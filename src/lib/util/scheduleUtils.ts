import Song from '../Song';
import { IScheduleEventData, ISection, ISequenceEvent, ITimedSequence } from '../data/interface';

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
  currentSection: ISection,
): IScheduleEventData[] {
  if (!currentSection) {
    return getEventScheduleListForNonSectionSong(fromTime, toTime, song);
  }

  // if currentSection is given, then the song has sections
  return getEventScheduleListFoSectionSong(fromTime, toTime, song, currentSection);
}

function getEventScheduleListFoSectionSong(
  fromTime: number,
  toTime: number,
  song: Song,
  currentSection: ISection,
): IScheduleEventData[] {
  const results: IScheduleEventData[] = [];

  const section = currentSection;
  const sectionIteration = getSectionIterationAtTime(section, fromTime, song.bpm);
  const fromTimeInSection = fromTime - section.startedAt.toTime(song.bpm);
  console.log(`section "${section.start.toString()}"`, sectionIteration, fromTimeInSection);
  let counter = 0;
  while (counter < 100) {
    song.timedSequences.forEach(timedSequence => {
      if (timedSequence.absoluteStart.toTime(song.bpm) > toTime) {
        console.log('skip');
      }
    });

    counter++;
  }

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
  if (!section.startedAt) {
    throw new Error(
      `Section (${section.start.toString()}-${section.end.toString()}) has no 'startedAt' value, cannot get iteration`,
    );
  }
  const sectionStart = section.start.toTime(bpm);
  const sectionStartedAt = section.startedAt.toTime(bpm);
  const sectionEnd = section.end.toTime(bpm);
  const sectionLength = sectionEnd - sectionStart;
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
