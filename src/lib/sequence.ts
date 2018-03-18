import MusicTime from 'musictime';
import { ISample } from 'webaudio-sample-loader';

export interface ISong {
  sequences: ISequence[];
}

export interface ISequence {
  id: string;
  events: ISequenceEvent[];
  outputId?: string;
  target: any; // todo iinstrument?
}

export enum SequenceEventType {
  SAMPLE = 'play-sample',
  NOTE = 'note',
}

export interface ISequenceEvent {
  type: SequenceEventType;
  time: MusicTime;
}

export interface ISampleEvent extends ISequenceEvent {
  sample: ISample;
  volume: number;
}

/*
 {
    id: SequenceIds.DRUMS_A1,
    songLayerId: InstrumentIds.DRUMS,
    notes: {
      '0.0.0': [sampleIds.DRUMS_A_SNARE, 1, sampleIds.DRUMS_A_KICK, 1, sampleIds.DRUMS_A1_HIHAT, 1],
      '2.0.0': [sampleIds.DRUMS_A_SNARE, 1, sampleIds.DRUMS_A_KICK, 1, sampleIds.DRUMS_A1_HIHAT, 1],
    },
  },
 */

export interface ICreateSampleEvents {
  [time: string]: any[]; // '0.0.0': [sampleIds.DRUMS_A_SNARE, 1, sampleIds.DRUMS_A_KICK, 1, sampleIds.DRUMS_A1_HIHAT, 1],
}

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
      const sampleName = dataList[i]; // todo check type of these two
      const volume = dataList[i + 1];

      const sampleEvent: ISampleEvent = {
        volume,
        time: MusicTime.fromString(key), // even if time is the same for this key, create new instances (so we can later on change them if needed)
        type: SequenceEventType.SAMPLE,
        sample: null,
      };

      sequence.events.push(sampleEvent);
    }
  });

  return sequence;
}
