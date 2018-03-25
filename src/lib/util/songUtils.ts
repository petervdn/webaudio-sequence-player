import Song from '../Song';
import { ISampleEvent, ISequenceEvent } from '../data/interface';
import { SequenceEventType } from '../data/enum';
import SampleManager from 'sample-manager/lib/SampleManager';
import { logSequence } from './sequenceUtils';

export function setSamplesOnSampleEvents(song: Song, sampleManager: SampleManager): void {
  for (let s = 0; s < song.sequences.length; s++) {
    for (let e = 0; e < song.sequences[s].events.length; e++) {
      const event: ISequenceEvent = song.sequences[s].events[e];

      if (event.type === SequenceEventType.SAMPLE) {
        (<ISampleEvent>event).sample = sampleManager.getSampleByName(
          (<ISampleEvent>event).sampleName,
        );
      }
    }
  }
}
// export function logSong(song: Song): void {
//   console.log(song);
//   song.timedSequences.forEach(timedSequence => {
//     console.log(`--- ${timedSequence.sequence.id} (${timedSequence.absoluteStart.toString()}) ---`);
//     logSequence(timedSequence.sequence);
//   });
// }

/**
 * Calculates the duration of the song
 * @param {Song} song
 * @returns {number}
 */
// export function getSongDuration(song: Song): number {
//   let latestTime = 0;
//   song.timedSequences.forEach(timedSequence => {
//     const sequenceStartTime = timedSequence.absoluteStart.toTime(song.bpm);
//   })
// }
