import { ISampleEvent, ISequence, ISequenceEvent, ITimedSequence } from './data/interface';
import MusicTime from 'musictime';
import { SequenceEventType } from './data/enum';

export default class Song {
  public timedSequences: ITimedSequence[] = [];
  public usedSampleNames: string[] = [];

  constructor() {}

  public addSequenceAtTime(sequence: ISequence, time: MusicTime): void {
    // add sequence with time, and give an id to the combination
    this.timedSequences.push({
      sequence,
      absoluteStart: time,
      id: `${this.timedSequences.length + 1}`,
    });

    sequence.events.forEach(event => {
      // if there are samples in the sequence, add their name to the list
      if (
        event.type === SequenceEventType.SAMPLE &&
        this.usedSampleNames.indexOf((<ISampleEvent>event).sampleName) === -1
      ) {
        this.usedSampleNames.push((<ISampleEvent>event).sampleName);
      }

      // and set the correct absolute time
      event.absoluteStart = time.add(event.relativeStart);
    });
  }

  public getUsedSampleNames(): string[] {
    // todo getter?
    return this.usedSampleNames;
  }

  /**
   * Returns true if all samples are loaded.
   * @returns {boolean}
   */
  public getIsLoaded(): boolean {
    for (let s = 0; s < this.timedSequences.length; s++) {
      for (let e = 0; e < this.timedSequences[s].sequence.events.length; e++) {
        const sequenceEvent: ISequenceEvent = this.timedSequences[s].sequence.events[e];
        if (
          sequenceEvent.type === SequenceEventType.SAMPLE &&
          !(<ISampleEvent>sequenceEvent).sample
        ) {
          return false;
        }
      }
    }

    return true;
  }
}
