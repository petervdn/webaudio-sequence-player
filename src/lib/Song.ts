import {
  ISampleEvent,
  ISequence,
  ISequenceEvent,
  ITimedSequence,
  ISection,
} from './data/interface';
import MusicTime from 'musictime';
import { SequenceEventType } from './data/enum';
import { createGapSections, createSection } from './util/sectionUtils';
import { calculateTimelineEnd } from './util/songUtils';

export default class Song {
  // todo make more stuff private?
  public timedSequences: ITimedSequence[] = [];
  public bpm: number;
  public sequences: ISequence[] = []; // unique sequences

  private usedSampleNames: string[] = []; // used by the player to decide what to load
  private sections: ISection[] = [];
  private timelineEnd: MusicTime | null = null;

  constructor(bpm: number = 120) {
    // todo force bpm within a range
    this.bpm = bpm;

    this.updateSectionsAndTimelineLength();
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
      id: `timedseq-${this.timedSequences.length + 1}`,
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

    this.updateSectionsAndTimelineLength();
  }

  /**
   * Add a section, and fill every remaining gap up with an isGap section (so every timewindow is covered)
   * @param {MusicTime} start
   * @param {MusicTime} end
   * @param {number} repeat
   * @returns {ISection}
   */
  public addSection(start: MusicTime, end: MusicTime, repeat = -1): ISection {
    if (!this.timelineEnd) {
      throw new Error('No timelineEnd set');
    }

    if (start >= this.timelineEnd) {
      throw new Error('Start of section should be before timelineEnd');
    }
    if (end > this.timelineEnd) {
      throw new Error('End of section should be before, or equal to, timelineEnd');
    }
    const newSection: ISection = createSection(start, end, repeat, false);
    this.sections.push(newSection);

    this.updateSectionsAndTimelineLength();

    return newSection;
  }

  /**
   * Remove all gap-sections and re-add all gaps
   */
  private updateSectionsAndTimelineLength(): void {
    // if there are no sequences, set length of zero // todo also no events. should all probably be taken care of in getSongEndTime and just have a songlength of 0 result
    if (this.sequences.length === 0) {
      this.timelineEnd = new MusicTime();
      return;
    }

    // decide what the end of the song is
    this.timelineEnd = calculateTimelineEnd(this);

    // filter out all generated gaps
    this.sections = this.sections.filter(section => !section.isGap);

    // create new gaps
    const gaps = createGapSections(this.sections, this.timelineEnd);
    this.sections.push(...gaps);

    // sort all on start
    this.sections.sort((a, b) => a.start.toSixteenths() - b.start.toSixteenths());

    // give id (based on index)
    this.sections.forEach((section, index) => (section.id = `section-${index}`));
  }

  public getSections(): ISection[] {
    return this.sections;
  }

  public getUsedSampleNames(): string[] {
    return this.usedSampleNames;
  }

  public getTimelineEnd(): MusicTime | null {
    return this.timelineEnd;
  }

  /**
   * Checks if all ISampleEvents have a reference to a sample, and all those samples are loaded.
   * @returns {boolean}
   */
  public getIsLoaded(): boolean {
    for (let s = 0; s < this.sequences.length; s += 1) {
      const sequence = this.sequences[s];
      for (let e = 0; e < sequence.events.length; e += 1) {
        const sequenceEvent: ISequenceEvent = sequence.events[e];
        if (
          (sequenceEvent.type === SequenceEventType.SAMPLE &&
            !(<ISampleEvent>sequenceEvent).sample) ||
          !(<ISampleEvent>sequenceEvent).sample!.audioBuffer
        ) {
          return false;
        }
      }
    }

    return true;
  }
}
