import Song from '../Song';
import { ISampleEvent, ISequenceEvent } from '../data/interface';
import { SequenceEventType } from '../data/enum';
import SampleManager from 'sample-manager/lib/SampleManager';
import { logSequence } from './sequenceUtils';

export function setSamplesOnSampleEvents(song: Song, sampleManager: SampleManager): void {
  for (let ts = 0; ts < song.timedSequences.length; ts++) {
    for (let e = 0; e < song.timedSequences[ts].sequence.events.length; e++) {
      const event: ISequenceEvent = song.timedSequences[ts].sequence.events[e];

      if (event.type === SequenceEventType.SAMPLE) {
        (<ISampleEvent>event).sample = sampleManager.getSampleByName(
          (<ISampleEvent>event).sampleName,
        );
      }
    }
  }
}
export function logSong(song: Song): void {
  console.log(song);
  song.timedSequences.forEach(timedSequence => {
    console.log(`--- ${timedSequence.sequence.id} (${timedSequence.absoluteStart.toString()}) ---`);
    logSequence(timedSequence.sequence);
  });
}
