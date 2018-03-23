import { ISampleEvent, ISequence, ICreateSampleEvents } from './interface';
import { SequenceEventType } from './enum';
import MusicTime from 'musictime';

export function createSampleSequence(id: string, events: ICreateSampleEvents): ISequence {
  const sequence: ISequence = {
    id,
    target: null,
    events: [],
  };

  Object.keys(events).forEach(key => {
    const dataList: any[] = events[key];

    // todo check datalist is correct length (even)
    for (let i = 0; i < dataList.length; i += 2) {
      const sampleName = dataList[i]; // todo check type and correct values of these two
      const volume = dataList[i + 1];

      const sampleEvent: ISampleEvent = {
        sampleName,
        volume,
        relativeStart: MusicTime.fromString(key), // even if time is the same for this key, create new instances (so we can later on change them if needed)
        absoluteStart: null, // will be set once the sequence is added to a song (only then do we know the actual start time)
        type: SequenceEventType.SAMPLE,
        sample: null,
      };

      sequence.events.push(sampleEvent);
    }
  });

  return sequence;
}
