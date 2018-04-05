import { expect } from 'chai';
import 'web-audio-test-api';
import { createSampleSequence } from '../src/lib/util/sequenceUtils';
import MusicTime from 'musictime';
import Song from '../src/lib/Song';
import {getEventScheduleList, getSectionIterationAtTime} from '../src/lib/util/scheduleUtils';

describe('scheduleUtils', () => {
  it('should get correction section iteration', () => {
    const section = {
      startedAt: 8,
      start: new MusicTime(4), // 8s
      end: new MusicTime(8),   // 16s
    };
    expect(getSectionIterationAtTime(section, 7, 120)).to.equal(-1);
    expect(getSectionIterationAtTime(section, 8, 120)).to.equal(0);
    expect(getSectionIterationAtTime(section, 16, 120)).to.equal(1);
    expect(getSectionIterationAtTime(section, 25, 120)).to.equal(2);
  });

  it('should throw an error when retrieving iteration without startedAt', () => {
    const section = {
      start: new MusicTime(4),
      end: new MusicTime(8),
    };
    expect(() => {
      getSectionIterationAtTime(section, 7, 128)
    }).to.throw();
  });


  it('set correct initial section', () => {
    // todo
  });

  describe('scheduling a song without sections', () => {
    it('should collect scheduleList', () => {
      const song = new Song(60);
      const seq = createSampleSequence('id', {
        '0.0.0': ['kick'],
        '0.2.0': ['snare'],
      });
      song.addSequenceAtTime(seq, new MusicTime(0, 0, 0));
      song.addSequenceAtTime(seq, new MusicTime(1, 0, 0));

      const scheduleList = getEventScheduleList(song, 0, 10, null);
      expect(scheduleList.length).to.equal(4);
      expect(scheduleList.map(item => item.absoluteSeconds)).to.deep.equal([0, 2, 4, 6]);
    });

    it('should collect partial scheduleList', () => {
      const song = new Song(60);
      const seq = createSampleSequence('id', {
        '0.0.0': ['kick'],
        '0.2.0': ['snare'],
      });
      song.addSequenceAtTime(seq, new MusicTime(0, 0, 0));
      song.addSequenceAtTime(seq, new MusicTime(1, 0, 0));

      const scheduleList = getEventScheduleList(song, 0, 5, null);
      expect(scheduleList.length).to.equal(3);
      expect(scheduleList.map(item => item.absoluteSeconds)).to.deep.equal([0, 2, 4]);
    });

    it('should not collect events on the exact toTime', () => {
      const song = new Song(60);
      const seq = createSampleSequence('id', {
        '0.0.0': ['kick'],
        '0.2.0': ['snare'],
      });
      song.addSequenceAtTime(seq, new MusicTime(0, 0, 0));

      const scheduleList = getEventScheduleList(song, 0, 2, null);
      expect(scheduleList.length).to.equal(1);
    });

    it('should not get scheduleList items twice', () => {
      const song = new Song(60);
      const seq = createSampleSequence('id', { '0.0.0': ['kick'] });
      song.addSequenceAtTime(seq, new MusicTime(0, 0, 0));

      const firstScheduleList = getEventScheduleList(song, 0, 5, null);
      const secondScheduleList = getEventScheduleList(song, 0, 5, null);
      expect(firstScheduleList.length).to.equal(1);
      expect(secondScheduleList.length).to.equal(0);
    });

    it('should skip events before toTime in scheduleList', () => {
      const song = new Song(60);
      const seq = createSampleSequence('id', { '0.0.0': ['kick'], '0.1.0': ['kick'] });
      song.addSequenceAtTime(seq, new MusicTime(0, 0, 0));

      const scheduleList = getEventScheduleList(song, 0.1, 2, null);
      expect(scheduleList.length).to.equal(1);
    });
  });
});
