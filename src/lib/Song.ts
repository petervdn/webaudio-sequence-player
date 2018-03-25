import { ISampleEvent, ISequence, ISequenceEvent, ITimedSequence } from './data/interface';
import MusicTime from 'musictime';
import { SequenceEventType } from './data/enum';

export default class Song {
  public timedSequences: ITimedSequence[] = [];
  public bpm: number;
  public loopPoints: any[] = [];
  public sequences: ISequence[] = []; // unique sequences

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
    // check if there is another sequence with the same id (same id is allowed, but only when it's the same instance)
    const seqWithSameId = this.sequences.find(
      existingSequence => existingSequence.id === sequence.id,
    );
    if (seqWithSameId && seqWithSameId !== sequence) {
      throw new Error(`There is already a sequence with id ${sequence.id}`);
    }

    // add unique sequences to the list
    if (!seqWithSameId) {
      this.sequences.push(sequence);
    }

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
    for (let s = 0; s < this.sequences.length; s++) {
      const sequence = this.sequences[s];
      for (let e = 0; e < sequence.events.length; e++) {
        const sequenceEvent: ISequenceEvent = sequence.events[e];
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
