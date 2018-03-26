import {expect} from 'chai';
import Song from "../src/lib/Song";
import MusicTime from 'musictime';
import { createSampleSequence } from '../src/lib/util/sequenceUtils';

describe('Song', () => {
  it('should construct', () => {
    const song = new Song(120);
    expect(song.bpm).to.equal(120);
  });

  it('should add a sequence', () => {
    const song = new Song(120);
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
    const song = new Song(120);
    const seq1 = createSampleSequence('seq', {'0.0.0': ['sample']});
    const seq2 = createSampleSequence('seq', {'0.0.0': ['sample']});

    song.addSequenceAtTime(seq1, new MusicTime(0,0,0));
    expect(() => {
      song.addSequenceAtTime(seq2, new MusicTime(0,0,0))
    }).to.throw('There is already a different sequence with id seq');
  });

  it('should add the same sequence more than once', () => {
    const song = new Song(120);
    const seq1 = createSampleSequence('seq', {'0.0.0': ['sample']});

    song.addSequenceAtTime(seq1, new MusicTime(0,0,0));
    song.addSequenceAtTime(seq1, new MusicTime(0,0,0));
    expect(song.timedSequences.length).to.equal(2);
  });
  it('should collect uniquely used samples', () => {
    const song = new Song(120);
    const seq1 = createSampleSequence('seq', {
      '0.0.0': ['kick', 1, 'snare', 1],
      '1.0.0': ['kick', 1, 'clap', 1]
    });

    song.addSequenceAtTime(seq1, new MusicTime(0,0,0));
    song.addSequenceAtTime(seq1, new MusicTime(1,0,0));
    expect(song.getUsedSampleNames()).to.deep.equal(['kick', 'snare', 'clap']);
  });

});
