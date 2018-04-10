import { ISection } from '../data/interface';
import MusicTime from 'musictime';

export function createSectionsForGaps(sections: ISection[], end: MusicTime): ISection[] {
  let start = new MusicTime(0, 0, 0); // start of element that you want to add
  let sectionEnd = end;
  let reachedEnd = false;

  // if there are no sections, return one from start to end
  if (sections.length === 0) {
    return [
      {
        start,
        end: end.clone(),
        isGap: true,
        loop: 1,
      },
    ];
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
      results.push({ start: start.clone(), end: sectionStart.clone(), isGap: true, loop: 1 });
    }
    start = sectionEnd;
  }

  //  if last result doesnt reach to the end, add one that does
  const latestResult = sectionEnd;
  if (!reachedEnd && latestResult.toSixteenths() !== end.toSixteenths()) {
    results.push({
      start: latestResult.clone(),
      end: end.clone(),
      isGap: true,
      loop: 1,
    });
  }

  return results;
}
