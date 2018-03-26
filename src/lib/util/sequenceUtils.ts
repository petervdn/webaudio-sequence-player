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

    for (let i = 0; i < dataList.length; i += 2) {
      const sampleName = dataList[i]; // todo check and test type and correct values of these two
      const volume = dataList[i + 1];

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
