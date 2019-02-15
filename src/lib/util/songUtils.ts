import Song from '../Song';
import { ISampleEvent, ISection, SequenceEvent } from '../data/interface';
import { SequenceEventType } from '../data/enum';
import SampleManager from 'sample-manager';
import MusicTime from 'musictime';

export function setSamplesOnSampleEvents(song: Song, sampleManager: SampleManager): void {
  for (let s = 0; s < song.sequences.length; s += 1) {
    for (let e = 0; e < song.sequences[s].events.length; e += 1) {
      const event: SequenceEvent = song.sequences[s].events[e];

      // if (event.type === SequenceEventType.SAMPLE) {
      //   (<ISampleEvent>event).sample = sampleManager.getSampleByName(
      //     (<ISampleEvent>event).sampleName,
      //   );
      // }
    }
  }
}

// todo pass a reference time (so we dont have to check everything again)
// todo this whole thing can probably be optimized a lot
export function calculateTimelineEnd(song: Song): MusicTime {
  let latestTime = new MusicTime(0, 0, 0);
  song.timedSequences.forEach(ts => {
    ts.sequence.events.forEach(e => {
      // todo this should also take in consideration the length of the sample (or whatever other event types there will be)
      const eventTime = ts.absoluteStart.add(e.relativeStart);
      if (eventTime.toSixteenths() > latestTime.toSixteenths()) {
        latestTime = eventTime;
      }
    });
  });

  // ceil to next bar
  return new MusicTime(latestTime.bars + 1, 0, 0);
}

// export function logSong(song: Song): void {
//   console.log(song);
//   song.timedSequences.forEach(timedSequence => {
//     console.log(`--- ${timedSequence.sequence.id} (${timedSequence.absoluteStart.toString()}) ---`);
//     logSequence(timedSequence.sequence);
//   });
// }

// export function getSongDuration(song: Song): number {
//   let latestTime = 0;
//   song.timedSequences.forEach(timedSequence => {
//     const sequenceStartTime = timedSequence.absoluteStart.toTime(song.bpm);
//   })
// }
/**
 * Finds the first section where the time >= sectionStart and time < sectionEnd
 * @param {Song} song
 * @param {number} time
 * @returns {ISection}
 */
export function getSectionOnTime(song: Song, time: number): ISection | undefined {
  return song
    .getSections()
    .find(section => time >= section.start.toTime(song.bpm) && time < section.end.toTime(song.bpm));
}
