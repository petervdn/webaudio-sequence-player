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

  const timeKeys = Object.keys(events);

  if (timeKeys.length === 0) {
    throw new Error("Can't create a sequence without events");
  }

  Object.keys(events).forEach(musicTimeString => {
    const dataList: any[] = events[musicTimeString];

    for (let i = 0; i < dataList.length; i += 2) {
      const sampleName = dataList[i]; // todo check and test type and correct values of these two
      const volume = dataList[i + 1] || 1;

      // volume may be left out, but can only happen when assigning one sample: {'0.0.0': ['sample1']}
      if (volume !== void 0 && typeof volume !== 'number') {
        // volume is set, but is not a number. catches this case: '0.0.0': ['sample1', 'sample2']
        throw new TypeError(`Expecting a volume value but found a ${typeof volume}`);
      }

      const sampleEvent: ISampleEvent = {
        sampleName,
        volume,
        sample: null,
        ...createBaseSequenceEventFromTimeString(
          SequenceEventType.SAMPLE,
          MusicTime.fromString(musicTimeString),
        ),
      };

      sequence.events.push(sampleEvent);
    }
  });

  return sequence;
}

/**
 * Creates an ISequenceEvent object with properties that all extended types share.
 * @param {SequenceEventType} type
 * @param {MusicTime} musicTime
 * @returns {ISequenceEvent}
 */
function createBaseSequenceEventFromTimeString(
  type: SequenceEventType,
  musicTime: MusicTime,
): ISequenceEvent {
  return {
    type,
    relativeStart: musicTime,
    lastScheduledData: {},
  };
}

export function getLatestEventInSequence(sequence: ISequence): ISequenceEvent {
  let latestTime = 0;
  let latestEvent: ISequenceEvent;
  sequence.events.forEach(event => {
    const eventStart = event.relativeStart.toSixteenths();
    if (eventStart > latestTime) {
      latestEvent = event;
      latestTime = eventStart;
    }
  });

  return latestEvent;
}
