import { expect } from 'chai';
import MusicTime from 'musictime';
import { createSection } from '../src/lib/util/sectionUtils';

describe('sectionUtils', () => {
  it('should set length when creating a section', () => {
    const section = createSection(new MusicTime(1), new MusicTime(2, 1), 1, false);
    expect(section.length.toString()).to.equal('1.1.0');
  });

  it('should throw an error when section length is invalid', () => {
    expect(() => {
      createSection(new MusicTime(1,2), new MusicTime(1,1), 1, false);
    }).to.throw("A section's end should be later than its start");
    expect(() => {
      createSection(new MusicTime(1,2), new MusicTime(1,2), 1, false);
    }).to.throw("A section's end should be later than its start");
  });

  it('should create gaps', () => {

  });
});
