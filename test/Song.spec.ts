import {expect} from 'chai';
import Song from "../src/lib/Song";
import MusicTime from 'musictime';
import { createSampleSequence } from '../src/lib/util/sequenceUtils';

describe('Song', () => {
  it('should construct with default bpm', () => {
    const song = new Song();
    expect(song.bpm).to.equal(120);
  });

  it('should construct with given bpm', () => {
    const song = new Song(100);
    expect(song.bpm).to.equal(100);
  });

  it('should add a sequence', () => {
    const song = new Song();
    const seq = createSampleSequence('seq', {
      '0.1.2': ['sample1', 1, 'sample2', 1],
      '1.2.3': ['sample3', 0.5],
    });

    song.addSequenceAtTime(seq, new MusicTime(1,2,3));
    expect(song.timedSequences.length).to.equal(1);
    expect(song.timedSequences[0].id).to.equal('1');
    expect(song.timedSequences[0].absoluteStart.toString()).to.equal('1.2.3');
  });

  it('should not add two different sequences with the same id', () => {
    const song = new Song();
    const seq1 = createSampleSequence('seq', {'0.0.0': ['sample']});
    const seq2 = createSampleSequence('seq', {'0.0.0': ['sample']});

    song.addSequenceAtTime(seq1, new MusicTime(0,0,0));
    expect(() => {
      song.addSequenceAtTime(seq2, new MusicTime(0,0,0))
    }).to.throw('There is already a different sequence with id seq');
  });

  it('should add the same sequence more than once', () => {
    const song = new Song();
    const seq1 = createSampleSequence('seq', {'0.0.0': ['sample']});

    song.addSequenceAtTime(seq1, new MusicTime(0,0,0));
    song.addSequenceAtTime(seq1, new MusicTime(0,0,0));
    expect(song.timedSequences.length).to.equal(2);
  });
  it('should collect uniquely used samples', () => {
    const song = new Song();
    const seq1 = createSampleSequence('seq', {
      '0.0.0': ['kick', 1, 'snare', 1],
      '1.0.0': ['kick', 1, 'clap', 1]
    });

    song.addSequenceAtTime(seq1, new MusicTime(0,0,0));
    song.addSequenceAtTime(seq1, new MusicTime(1,0,0));
    expect(song.getUsedSampleNames()).to.deep.equal(['kick', 'snare', 'clap']);
  });

  it('should set timelineLength', () => {
    const song1 = new Song();
    const song2 = new Song();
    const song3 = new Song();
    const seq = createSampleSequence('seq', {
      '0.0.0': ['kick'],
      '0.1.0': ['snare'],
      '0.2.0': ['kick'],
      '0.3.0': ['snare'],
    });

    song1.addSequenceAtTime(seq, new MusicTime(0, 0, 0));
    song2.addSequenceAtTime(seq, new MusicTime(0, 0, 1));
    song3.addSequenceAtTime(seq, new MusicTime(0, 1, 0));

    expect(song1.getTimelineEnd().toString()).to.equal('1.0.0');
    expect(song2.getTimelineEnd().toString()).to.equal('1.0.0');
    expect(song3.getTimelineEnd().toString()).to.equal('2.0.0');
  });

  it('should add 1 gap-section for full song when there are no sections', () => {
      const song = new Song();
      const seq = createSampleSequence('seq', {
        '0.0.0': ['kick'],
        '0.1.0': ['snare'],
        '0.2.0': ['kick'],
        '0.3.0': ['snare'],
      });

      // song should have 1 full (gap)section covering the whole song
      song.addSequenceAtTime(seq, new MusicTime());
      const sections = song.getSections();
      expect(sections.length).to.equal(1);
      expect(sections[0].isGap).to.equal(true);
      expect(sections[0].start.toString()).to.equal('0.0.0');
      expect(sections[0].end.toString()).to.equal('1.0.0');
      expect(sections[0].length.toString()).to.equal('1.0.0');
    });

  it('should add gaps before and after a section', () => {
    const song = new Song();
    const seq = createSampleSequence('seq', {
      '0.0.0': ['kick'],
      '0.1.0': ['snare'],
      '0.2.0': ['kick'],
      '0.3.0': ['snare'],
    });

    song.addSequenceAtTime(seq, new MusicTime());

    // adding a section (not starting at 0 and not reaching end) makes 3 sections
    song.addSection(new MusicTime(0,1,0), new MusicTime(0,2,0));
    const sections = song.getSections();
    expect(sections.length).to.equal(3);
    expect(sections[0].isGap).to.equal(true);
    expect(sections[0].start.toString()).to.equal('0.0.0');
    expect(sections[0].end.toString()).to.equal('0.1.0');
    expect(sections[1].isGap).to.equal(false);
    expect(sections[1].start.toString()).to.equal('0.1.0');
    expect(sections[1].end.toString()).to.equal('0.2.0');
    expect(sections[2].isGap).to.equal(true);
    expect(sections[2].start.toString()).to.equal('0.2.0');
    expect(sections[2].end.toString()).to.equal('1.0.0');
  });

  it('should add gaps with 2 overlapping sections', () => {
    const song = new Song();
    const seq = createSampleSequence('seq', {
      '0.0.0': ['kick'],
      '0.1.0': ['snare'],
      '0.2.0': ['kick'],
      '0.3.0': ['snare'],
    });

    song.addSequenceAtTime(seq, new MusicTime());

    // adding a section (not starting at 0 and not reaching end) makes 3 sections
    song.addSection(new MusicTime(0,1,0), new MusicTime(0,2,0));
    song.addSection(new MusicTime(0,0,2), new MusicTime(0,1,2));
    const sections = song.getSections();
    expect(sections.length).to.equal(4);

    expect(sections[0].isGap).to.equal(true);
    expect(sections[0].start.toString()).to.equal('0.0.0');
    expect(sections[0].end.toString()).to.equal('0.0.2');
    expect(sections[1].isGap).to.equal(false);
    expect(sections[1].start.toString()).to.equal('0.0.2');
    expect(sections[1].end.toString()).to.equal('0.1.2');
    expect(sections[2].isGap).to.equal(false);
    expect(sections[2].start.toString()).to.equal('0.1.0');
    expect(sections[2].end.toString()).to.equal('0.2.0');
    expect(sections[3].isGap).to.equal(true);
    expect(sections[3].start.toString()).to.equal('0.2.0');
    expect(sections[3].end.toString()).to.equal('1.0.0');

    // todo this goes wrong when one section fully overlaps the other one
  });

  it('should add gaps with 2 adjacent sections', () => {
    const song = new Song();
    const seq = createSampleSequence('seq', {
      '0.0.0': ['kick'],
      '0.1.0': ['snare'],
      '0.2.0': ['kick'],
      '0.3.0': ['snare'],
    });

    song.addSequenceAtTime(seq, new MusicTime());

    // adding a section (not starting at 0 and not reaching end) makes 3 sections
    song.addSection(new MusicTime(0,1,0), new MusicTime(0,2,0));
    song.addSection(new MusicTime(0,2,0), new MusicTime(0,3,0));
    const sections = song.getSections();
    expect(sections.length).to.equal(4);

    expect(sections[0].isGap).to.equal(true);
    expect(sections[0].start.toString()).to.equal('0.0.0');
    expect(sections[0].end.toString()).to.equal('0.1.0');
    expect(sections[1].isGap).to.equal(false);
    expect(sections[1].start.toString()).to.equal('0.1.0');
    expect(sections[1].end.toString()).to.equal('0.2.0');
    expect(sections[2].isGap).to.equal(false);
    expect(sections[2].start.toString()).to.equal('0.2.0');
    expect(sections[2].end.toString()).to.equal('0.3.0');
    expect(sections[3].isGap).to.equal(true);
    expect(sections[3].start.toString()).to.equal('0.3.0');
    expect(sections[3].end.toString()).to.equal('1.0.0');

    // todo this goes wrong when one section fully overlaps the other one
  });

  it('should not allow adding sections after timelineEnd', () => {
    const emptySong = new Song();
    expect(() => {
      emptySong.addSection(new MusicTime(0),new MusicTime(1));
    }).to.throw('Start of section should be before timelineEnd');

    const song = new Song();
    const seq = createSampleSequence('seq', {
      '0.0.0': ['kick'],
      '0.1.0': ['snare'],
      '0.2.0': ['kick'],
      '0.3.0': ['snare'],
    });

    song.addSequenceAtTime(seq, new MusicTime());
    expect(() => {
      song.addSection(new MusicTime(1),new MusicTime(2));
    }).to.throw('Start of section should be before timelineEnd');

    expect(() => {
      song.addSection(new MusicTime(0,2), new MusicTime(2));
    }).to.throw('End of section should be before, or equal to, timelineEnd');
  });

  it('should update songlength and sections while adding sections/sequences', () => {
    // todo
    expect(true).to.equal(true);
  })
});
