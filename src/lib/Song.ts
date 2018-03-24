import { ISampleEvent, ISequence, ISequenceEvent, ITimedSequence } from './data/interface';
import MusicTime from 'musictime';
import { SequenceEventType } from './data/enum';

export default class Song {
  public timedSequences: ITimedSequence[] = [];
  public bpm: number;
  public loopPoints: any[] = [];

  private usedSampleNames: string[] = [];

  constructor(bpm: number) {
    this.bpm = bpm;
  }

  /**
   * Adds a sequence to the song
   * @param {ISequence} sequence
   * @param {MusicTime} time
   */
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
    });
  }

  public getUsedSampleNames(): string[] {
    return this.usedSampleNames;
  }

  /**
   * Returns true if all ISampleEvents have a reference to a sample, and those samples are loaded.
   * @returns {boolean}
   */
  public getIsLoaded(): boolean {
    // todo we can loop through all sequences here (instead of all timed sequences)
    for (let s = 0; s < this.timedSequences.length; s++) {
      for (let e = 0; e < this.timedSequences[s].sequence.events.length; e++) {
        const sequenceEvent: ISequenceEvent = this.timedSequences[s].sequence.events[e];
        if (
          (sequenceEvent.type === SequenceEventType.SAMPLE &&
            !(<ISampleEvent>sequenceEvent).sample) ||
          !(<ISampleEvent>sequenceEvent).sample.audioBuffer
        ) {
          return false;
        }
      }
    }

    return true;
  }
}
