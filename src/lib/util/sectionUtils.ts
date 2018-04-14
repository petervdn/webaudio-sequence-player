import { ISection } from '../data/interface';
import MusicTime from 'musictime';

/**
 * Creates a list of gap-sections that fill the space between the given sections.
 * @param {ISection[]} sections
 * @param {MusicTime} end
 * @returns {ISection[]}
 */
export function createGapSections(sections: ISection[], end: MusicTime): ISection[] {
  let start = new MusicTime(0, 0, 0); // start of element that you want to add
  let sectionEnd = end;
  let reachedEnd = false;

  // if there are no sections, return one from start to end
  if (sections.length === 0) {
    return [createGapSection(start, end.clone())];
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
        results.push(createGapSection(start.clone(), sectionStart.clone()));
      }
    }
    start = sectionEnd;
  }

  //  if last result doesnt reach to the end, add one that does
  const latestResult = sectionEnd;
  if (!reachedEnd && latestResult.toSixteenths() !== end.toSixteenths()) {
    results.push(createGapSection(latestResult.clone(), end.clone()));
  }

  return results;
}

function createGapSection(start: MusicTime, end: MusicTime): ISection {
  return createSection(start, end, 0, true);
}

export function createSection(
  start: MusicTime,
  end: MusicTime,
  repeat: number,
  isGap: boolean,
): ISection {
  if (end <= start) {
    throw new Error("A section's end should be later than its start");
  }
  return {
    start,
    end,
    isGap,
    repeat,
    id: null,
    length: end.subtract(start),
  };
}
