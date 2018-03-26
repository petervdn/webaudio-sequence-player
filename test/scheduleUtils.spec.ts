import {expect} from 'chai';
import 'web-audio-test-api';
import { createSampleSequence } from '../src/lib/util/sequenceUtils';
import MusicTime from 'musictime';
import Song from '../src/lib/Song';
import { getEventScheduleList } from '../src/lib/util/scheduleUtils';

describe('scheduleUtils', () => {
  it('should collect scheduleList', () => {
    const song = new Song(60);
    const seq = createSampleSequence('id', {
      '0.0.0': ['kick'],
      '0.2.0': ['snare'],
    });
    song.addSequenceAtTime(seq, new MusicTime(0,0,0));
    song.addSequenceAtTime(seq, new MusicTime(1,0,0));

    const scheduleList = getEventScheduleList(0, 10, song);
    expect(scheduleList.length).to.equal(4);
    expect(scheduleList.map(item => item.absoluteSeconds)).to.deep.equal([0,2,4,6]);
  });

  it('should collect partial scheduleList', () => {
    const song = new Song(60);
    const seq = createSampleSequence('id', {
      '0.0.0': ['kick'],
      '0.2.0': ['snare'],
    });
    song.addSequenceAtTime(seq, new MusicTime(0,0,0));
    song.addSequenceAtTime(seq, new MusicTime(1,0,0));

    const scheduleList = getEventScheduleList(0, 5, song);
    expect(scheduleList.length).to.equal(3);
    expect(scheduleList.map(item => item.absoluteSeconds)).to.deep.equal([0,2,4]);
  });

  it('should not collect events on the exact toTime', () => {
    const song = new Song(60);
    const seq = createSampleSequence('id', {
      '0.0.0': ['kick'],
      '0.2.0': ['snare'],
    });
    song.addSequenceAtTime(seq, new MusicTime(0,0,0));

    const scheduleList = getEventScheduleList(0, 2, song);
    expect(scheduleList.length).to.equal(1);
  });

  it('should not get scheduleList items twice', () => {
    const song = new Song(60);
    const seq = createSampleSequence('id', {'0.0.0': ['kick']});
    song.addSequenceAtTime(seq, new MusicTime(0,0,0));

    const firstScheduleList = getEventScheduleList(0, 5, song);
    const secondScheduleList = getEventScheduleList(0, 5, song);
    expect(firstScheduleList.length).to.equal(1);
    expect(secondScheduleList.length).to.equal(0);
  });

  it('should skip events before toTime in scheduleList', () => {
    const song = new Song(60);
    const seq = createSampleSequence('id', {'0.0.0': ['kick'], '0.1.0': ['kick']});
    song.addSequenceAtTime(seq, new MusicTime(0,0,0));

    const scheduleList = getEventScheduleList(0.1, 2, song);
    expect(scheduleList.length).to.equal(1);
  });
});
