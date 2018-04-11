import { ISection } from '../data/interface';
import MusicTime from 'musictime';

/**
 * Creates a list of gap-sections that fill the space between the given sections.
 * @param {ISection[]} sections
 * @param {MusicTime} end
 * @returns {ISection[]}
 */
export function createSectionsForGaps(sections: ISection[], end: MusicTime): ISection[] {
  let start = new MusicTime(0, 0, 0); // start of element that you want to add
  let sectionEnd = end;
  let reachedEnd = false;

  // if there are no sections, return one from start to end
  if (sections.length === 0) {
    return [createSection(start, end.clone(), 1, true)];
  }
  sections.sort((a, b) => a.start.toSixteenths() - b.start.toSixteenths());
  const results: ISection[] = [];

  for (let i = 0; i < sections.length; i++) {
    const sectionStart = sections[i].start;
    sectionEnd = sections[i].end;

    if (sectionEnd.toSixteenths() === end.toSixteenths()) {
      reachedEnd = true;
    }

    for (let j = i + 1; j < sections.length; j++) {
      if (sections[j].start.toSixteenths() >= sectionEnd.toSixteenths()) {
        i = j - 1;
        break;
      } else {
        if (sections[j].end.toSixteenths() > sectionEnd.toSixteenths()) {
          sectionEnd = sections[j].end;
        }
      }
    }

    if (start.toSixteenths() < end.toSixteenths()) {
      // apparently there can be invalid values here
      if (start < sectionStart) {
        results.push(createSection(start.clone(), sectionStart.clone(), 1, true));
      }
    }
    start = sectionEnd;
  }

  //  if last result doesnt reach to the end, add one that does
  const latestResult = sectionEnd;
  if (!reachedEnd && latestResult.toSixteenths() !== end.toSixteenths()) {
    results.push(createSection(latestResult.clone(), end.clone(), 1, true));
  }

  return results;
}

export function createSection(
  start: MusicTime,
  end: MusicTime,
  loop: number,
  isGap: boolean,
): ISection {
  if (end <= start) {
    console.log('Error', start.toString(), end.toString());
    throw new Error("A section's end should be later than its start");
  }
  return {
    start,
    end,
    isGap,
    loop,
    length: end.subtract(start),
  };
}
