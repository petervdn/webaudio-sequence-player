import { ISequence, ITimedSequence } from './interface';
import MusicTime from 'musictime/lib/MusicTime';

export default class Song {
  private timedSequences: ITimedSequence[] = [];

  constructor() {}

  addSequenceAtTime(sequence: ISequence, time: MusicTime): void {
    this.timedSequences.push({
      time,
      sequence,
      id: `${this.timedSequences.length + 1}`,
    });
  }
}
