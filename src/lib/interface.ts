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
