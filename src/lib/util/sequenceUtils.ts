import { ISampleEvent, ISequence, ICreateSampleEvents } from '../data/interface';
import { SequenceEventType } from '../data/enum';
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
        type: SequenceEventType.SAMPLE,
        sample: null,
      };

      sequence.events.push(sampleEvent);
    }
  });

  return sequence;
}

export function logSequence(sequence: ISequence): void {
  sequence.events.forEach(event => {
    const timeData = event.relativeStart.toString();
    switch (event.type) {
      case SequenceEventType.SAMPLE: {
        console.log(`${timeData}\t${event.type}\t${(<ISampleEvent>event).sampleName}`);
        break;
      }
      default: {
        console.warn(`Unknown SequenceEventType ${event.type}`, event);
      }
    }
  });
}
