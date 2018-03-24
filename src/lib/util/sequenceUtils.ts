import { ISampleEvent, ISequence, ICreateSampleEvents, ISequenceEvent } from '../data/interface';
import { SequenceEventType } from '../data/enum';
import MusicTime from 'musictime';

/**
 * Creates a sequence with samplesEvents.
 * @param {string} id
 * @param {ICreateSampleEvents} events
 * @returns {ISequence}
 */
export function createSampleSequence(id: string, events: ICreateSampleEvents): ISequence {
  const sequence: ISequence = {
    id,
    target: null,
    events: [],
  };

  Object.keys(events).forEach(musicTimeString => {
    const dataList: any[] = events[musicTimeString];

    // todo check datalist is correct length (even)
    for (let i = 0; i < dataList.length; i += 2) {
      const sampleName = dataList[i]; // todo check type and correct values of these two
      const volume = dataList[i + 1];

      const sampleEvent: ISampleEvent = {
        sampleName,
        volume,
        sample: null,
        ...createBaseSequenceEvent(SequenceEventType.SAMPLE, musicTimeString),
      };

      sequence.events.push(sampleEvent);
    }
  });

  return sequence;
}

/**
 * Creates an ISequenceEvent object with properties that all extended types share.
 * @param {SequenceEventType} type
 * @param {string} musicTimeString
 * @returns {ISequenceEvent}
 */
function createBaseSequenceEvent(type: SequenceEventType, musicTimeString: string): ISequenceEvent {
  return {
    type,
    relativeStart: MusicTime.fromString(musicTimeString), // even if time is the same for this key, create new instances (so we can later on change them if needed)
    lastScheduledData: {},
  };
}

export function logSequence(sequence: ISequence): void {
  let previousTimeData: string;
  sequence.events.forEach(event => {
    const timeData = event.relativeStart.toString();

    if (timeData !== previousTimeData) {
      console.log(timeData);
    }

    switch (event.type) {
      case SequenceEventType.SAMPLE: {
        console.log(`\t\t${(<ISampleEvent>event).sampleName}`);
        break;
      }
      default: {
        console.warn(`Unknown SequenceEventType ${event.type}`, event);
      }
    }

    previousTimeData = timeData;
  });
}
