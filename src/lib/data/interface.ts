import { SequenceEventType } from './enum';
import MusicTime from 'musictime';
import { ISample } from 'sample-manager';

export interface IScheduleTiming {
  interval: number; //
  lookAhead: number;
}

export interface ISequence {
  id: string;
  events: ISequenceEvent[];
  outputId?: string;
  target: any; // todo iinstrument?
}

export interface ITimedSequence {
  id: string;
  absoluteStart: MusicTime;
  sequence: ISequence;
}

export interface ISequenceEvent {
  type: SequenceEventType;
  relativeStart: MusicTime;
  lastScheduledData: ILastScheduledData;
}

export interface ILastScheduledData {
  [key: string]: number; // todo make more specific once we know better what is in here?
}

export interface ISampleEvent extends ISequenceEvent {
  sampleName: string;
  sample: ISample;
  volume: number;
}

export interface ICreateSampleEvents {
  [time: string]: any[]; // '0.0.0': [sampleIds.DRUMS_A_SNARE, 1, sampleIds.DRUMS_A_KICK, 1, sampleIds.DRUMS_A1_HIHAT, 1],
}
