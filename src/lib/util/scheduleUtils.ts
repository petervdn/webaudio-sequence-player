import Song from '../Song';
import {
  IScheduleEventData,
  ISection,
  ISequenceEvent,
  ITimedSequence,
  ISampleEvent,
} from '../data/interface';
import { getSectionOnTime } from '../util/songUtils';
import MusicTime from 'musictime/lib/MusicTime';

/**
 * Returns all ISequenceEvents whose time is in a given time window
 * @param {number} fromTime
 * @param {number} toTime
 * @param {Song} song
 * @param {ISection} currentSection
 * @returns {ISequenceEvent[]}
 */
// export function getEventScheduleList(
//   song: Song,
//   fromTime: number,
//   toTime: number,
//   currentSection: ISection,
// ): IScheduleEventData[] {
//   if (song.getSections().length === 0) {
//     if (currentSection) {
//       throw new Error('Song has no sections but there is a current section set');
//     }
//
//     return getEventScheduleListForNonSectionSong(fromTime, toTime, song);
//   }
//
//   if (!currentSection) {
//     throw new Error('Song has sections but there is no current section');
//   }
//
//   return getEventScheduleListForSectionSong(fromTime, toTime, song, currentSection);
// }

export function getEventScheduleList(
  song: Song,
  fromTime: number,
  toTime: number,
  currentSection: ISection,
): IScheduleEventData[] {
  console.log(`*** getEvents from ${fromTime} to ${toTime}`);
  console.time('schedule');
  const results: IScheduleEventData[] = [];

  /*tslint:enable*/
  console.log(
    `initial section: ${currentSection.start.toString()}-${currentSection.end.toString()} (length ${currentSection.length.toString()})`,
    'startedAt',
    currentSection.startedAt,
  );
  /*tslint:disable*/
  let section = currentSection;
  let sectionIteration = getSectionIterationAtTime(section, fromTime, song.bpm);
  let eventsInSection = getEventsInSection(song, section);

  // if there are no events ibn the section, we can already stop
  if (eventsInSection.length === 0) {
    return [];
  }

  // if the initial section does not match the given time (with regards to repeats), throw an error
  // this should not happen
  if (section.repeat > -1 && sectionIteration > section.repeat) {
    console.log(section.repeat > -1, sectionIteration > section.repeat);
    throw new Error('Initial section does not play at given time');
  }

  let counter = 0;

  whileIterationSearch: while (counter < 999) {
    // todo get rid of this check eventually?
    // check when the section starts for this iteration
    const sectionIterationStart =
      section.startedAt + sectionIteration * section.length.toTime(song.bpm);

    console.log(
      `%c-- section: ${section.start.toString()}-${section.end.toString()}, repeat:${
        section.repeat
      }, startedAt:${
        section.startedAt
      }, iteration:${sectionIteration}, startsAt:${sectionIterationStart}`,
      'color: blue',
    );
    // loop through all events in the section (which are ordered in time)
    for (let i = 0; i < eventsInSection.length; i++) {
      // console.log(i, eventsInSection.length);
      const timedEvent = eventsInSection[i];
      const sampleEvent = <ISampleEvent>timedEvent.event;
      const eventStart = sectionIterationStart + timedEvent.timeInSection;

      let result = '';
      if (eventStart < fromTime) {
        // too early
        result = 'before window start';
      } else if (eventStart > toTime) {
        // when event is too far ahead, we can stop (since everything is ordered)
        result = 'after window end';
        console.log(
          `%c${result} - ${sampleEvent.sampleName} (start: ${eventStart}, in section: ${
            timedEvent.timeInSection
          })`,
          `color: ${result === 'added' ? 'green' : 'red'}`,
        );
        break whileIterationSearch;
      } else if (eventStart >= fromTime && eventStart < toTime) {
        // add events in timewindow to results
        results.push({
          event: timedEvent.event,
          absoluteSeconds: eventStart,
        });

        result = 'added';
      } else {
        result = '??';
      }
      console.log(
        `%c${result} - ${sampleEvent.sampleName} (start: ${eventStart}, in section: ${
          timedEvent.timeInSection
        })`,
        `color: ${result === 'added' ? 'green' : 'red'}`,
      );
    }

    // looped through all events for the section, check what we need to do
    if (section.repeat === -1 || sectionIteration < section.repeat) {
      console.log('   next iteration');
      // section should loop forever
      sectionIteration++;
    } else {
      // switch to next section, find it first
      const nextSection = getSectionOnTime(song, section.end.toTime(song.bpm));

      if (nextSection) {
        console.log('   switch to next section');
        // next section starts at current end
        const currentSectionEndTime =
          section.startedAt + (sectionIteration + 1) * section.length.toTime(song.bpm);

        // we now know enough to change the section
        nextSection.startedAt = currentSectionEndTime;
        section = nextSection;
        eventsInSection = getEventsInSection(song, section);
        sectionIteration = 0;
      } else {
        // there is no next section, song has reached the end
        console.log('   switch to next section, but there is none');
        break whileIterationSearch;
      }
    }

    // console.log(counter);
    counter++;
  }

  console.timeEnd('schedule');
  return results;
}

export interface ITimedSequenceEvent {
  timedSequence: ITimedSequence;
  event: ISequenceEvent;
  timeInSection: number;
}

/**
 * Returns the event within the start/end time of a given section.
 * The resulting event will be wrapped in an object containing the timedSequence the event is in
 * and the relative time after the section's start.
 * @param {Song} song
 * @param {ISection} section
 * @returns {ITimedSequenceEvent[]}
 */
export function getEventsInSection(song: Song, section: ISection): ITimedSequenceEvent[] {
  const sectionStart = section.start.toTime(song.bpm);
  const sectionEnd = section.end.toTime(song.bpm);
  const results: ITimedSequenceEvent[] = [];
  song.timedSequences.forEach(timedSequence => {
    const sequenceStart = timedSequence.absoluteStart.toTime(song.bpm);

    // loop through all events in sequence
    timedSequence.sequence.events.forEach(event => {
      // get absolute start for event
      const absoluteStart = event.relativeStart.toTime(song.bpm) + sequenceStart;

      // check if it's in time window
      if (absoluteStart >= sectionStart && absoluteStart < sectionEnd) {
        // event start is in window
        results.push({
          event,
          timedSequence,
          timeInSection: absoluteStart - sectionStart,
        });
      }
    });
  });

  // order on startttime
  results.sort((a, b) => {
    return a.timeInSection - b.timeInSection;
  });

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
  if (section.startedAt === void 0) {
    throw new Error(
      `Section (${section.start.toString()}-${section.end.toString()}) has no 'startedAt' value, cannot get iteration`,
    );
  }
  const sectionLength = section.end.toTime(bpm) - section.start.toTime(bpm);
  return Math.floor((time - section.startedAt) / sectionLength);
}

/**
 * Returns events in the given timewindow for a song without sections.
 * @param {number} fromTime
 * @param {number} toTime
 * @param {Song} song
 * @returns {IScheduleEventData[]}
 */
// function getEventScheduleListForNonSectionSong(
//   fromTime: number,
//   toTime: number,
//   song: Song,
// ): IScheduleEventData[] {
//   const results: IScheduleEventData[] = [];
//   for (let ts = 0; ts < song.timedSequences.length; ts++) {
//     // start time for this sequence
//     const timedSequence = song.timedSequences[ts];
//     const sequenceStart: number = timedSequence.absoluteStart.toTime(song.bpm);
//
//     // loop through events for sequence
//     for (let e = 0; e < timedSequence.sequence.events.length; e++) {
//       const event: ISequenceEvent = timedSequence.sequence.events[e];
//
//       // skip if event was already scheduled in a previous call
//       if (eventHasBeenScheduled(song, event, timedSequence)) {
//         continue;
//       }
//
//       // calculate the absolute time for the event
//       const absoluteSeconds = sequenceStart + event.relativeStart.toTime(song.bpm);
//
//       // and add to results if it's in the timewindow
//       if (absoluteSeconds >= fromTime && absoluteSeconds < toTime) {
//         results.push({
//           event,
//           absoluteSeconds,
//         });
//
//         // and mark as scheduled
//         markEventAsScheduled(song, event, timedSequence);
//       }
//     }
//   }
//
//   return results;
// }

/**
 * So we can read and write the same value
 * @type {number}
 */
// const nonSectionSongMarkedValue = 1;

/**
 * Checks if the event was already scheduled in a previous schedule-call
 * @param {Song} song
 * @param {ISequenceEvent} event
 * @param {ITimedSequence} timedSequence
 * @returns {boolean}
 */
// function eventHasBeenScheduled(
//   song: Song,
//   event: ISequenceEvent,
//   timedSequence: ITimedSequence,
// ): boolean {
//   if (song.getSections().length === 0) {
//     // when there are no loop-points, a scheduled event has a value 1 for the id of the timedSequence it is in
//     return event.lastScheduledData[timedSequence.id] === nonSectionSongMarkedValue;
//   }
//   // todo
//   return false;
// }

/**
 * Marks the event as scheduled.
 * @param {Song} song
 * @param {ISequenceEvent} event
 * @param {ITimedSequence} timedSequence
 */
// function markEventAsScheduled(
//   song: Song,
//   event: ISequenceEvent,
//   timedSequence: ITimedSequence,
// ): void {
//   if (song.getSections().length === 0) {
//     event.lastScheduledData[timedSequence.id] = nonSectionSongMarkedValue;
//   }
//
//   // todo else
// }

export function clearAllLastScheduleData(song: Song): void {
  for (let s = 0; s < song.sequences.length; s++) {
    for (let e = 0; e < song.sequences[s].events.length; e++) {
      song.sequences[s].events[e].lastScheduledData = {};
    }
  }
}
