import { SequenceEventType } from './enum';
import MusicTime from 'musictime';
import { ISample } from 'sample-manager';

// export interface ISong {
//   timedSequences: ITimedSequence[];
// }

export interface ISequence {
  id: string;
  events: ISequenceEvent[];
  outputId?: string;
  target: any; // todo iinstrument?
}

export interface ITimedSequence {
  id: string;
  time: MusicTime;
  sequence: ISequence;
}

export interface ISequenceEvent {
  type: SequenceEventType;
  time: MusicTime;
}

export interface ISampleEvent extends ISequenceEvent {
  sample: ISample;
  volume: number;
}
