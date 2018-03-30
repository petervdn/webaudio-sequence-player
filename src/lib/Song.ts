import {
  ISampleEvent,
  ISequence,
  ISequenceEvent,
  ITimedSequence,
  ISection,
} from './data/interface';
import MusicTime from 'musictime';
import { SequenceEventType } from './data/enum';
import { getSongEndTime } from './util/songUtils';
import { createSectionsForGaps } from './util/sectionUtils';

export default class Song {
  // todo make more stuff private?
  public timedSequences: ITimedSequence[] = [];
  public bpm: number;
  public sequences: ISequence[] = []; // unique sequences

  private usedSampleNames: string[] = []; // used by the player to decide what to load
  private sections: ISection[] = [];
  private songEndTime: MusicTime = new MusicTime(0, 0, 0);

  constructor(bpm: number) {
    // todo force bpm within a range
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
      throw new Error(`There is already a different sequence with id ${sequence.id}`);
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

    this.songEndTime = getSongEndTime(this);
  }

  /**
   * Add a section, and fill every remaining gap up with an isGap section (so every timewindow is covered)
   * @param {MusicTime} start
   * @param {MusicTime} end
   */
  public addSection(start: MusicTime, end: MusicTime): void {
    if (end <= start) {
      throw new Error('The end of a section should be later than its start');
    }
    this.sections.push({
      start,
      end,
    });

    // remove all gap-sections and re-add all gaps
    this.sections = this.sections.filter(section => !section.isGap);
    const gaps = createSectionsForGaps(this.sections, this.songEndTime);
    this.sections.push(...gaps);
  }

  public getSections(): ISection[] {
    return this.sections;
  }

  public getUsedSampleNames(): string[] {
    return this.usedSampleNames;
  }

  public getSongEndTime(): MusicTime {
    return this.songEndTime;
  }

  /**
   * Checks if all ISampleEvents have a reference to a sample, and all those samples are loaded.
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
