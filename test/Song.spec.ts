import {expect} from 'chai';
import Song from "../src/lib/Song";

describe('Song', () => {
  it('should construct', () => {
    const song = new Song(120);
    expect(song.bpm).to.equal(120);
  });

  it('should add a sequence', () => {
    const song = new Song(120);
    expect(song.bpm).to.equal(120);
  });
});
