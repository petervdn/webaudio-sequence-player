import { SequenceEventType } from './enum';
import MusicTime from 'musictime';
import { ISample } from 'sample-manager';

export interface IScheduleTiming {
  interval: number; //
  lookAhead: number;
}

export interface ISongPlayerTimeData {
  playTime: number;
  playMusicTime: MusicTime;
}

export interface ISequence {
  id: string;
  events: SequenceEvent[];
  outputId?: string;
  target: any; // todo iinstrument?
}

export interface ITimedSequence {
  id: string;
  absoluteStart: MusicTime;
  sequence: ISequence;
}

export type SequenceEvent = ISampleEvent;

export interface ILastScheduledData {
  [key: string]: number; // todo describe this
}

export interface IAbstractSequenceEvent {
  type: SequenceEventType;
  relativeStart: MusicTime; // todo rename to start?
  relativeEnd: MusicTime;
  lastScheduledData: ILastScheduledData;
}

export interface ISampleEvent extends IAbstractSequenceEvent {
  type: SequenceEventType.SAMPLE;
  sampleName: string;
  volume: number;
}

export interface ICreateSampleEvents {
  [time: string]: any[]; // '0.0.0': [sampleIds.DRUMS_A_SNARE, 1, sampleIds.DRUMS_A_KICK, 1, sampleIds.DRUMS_A1_HIHAT, 1],
}

export interface IScheduleEventData {
  event: SequenceEvent;
  absoluteSeconds: number;
}

export interface ISection {
  start: MusicTime;
  end: MusicTime;
  length: MusicTime; // todo what is this
  startedAt?: number; // todo what is this
  isGap?: boolean;
  id: string | null;
  repeat: number; // how many times the section should repeat (-1 is forever)
}
