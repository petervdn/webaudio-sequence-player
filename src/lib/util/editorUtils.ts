import { ISequence, ISection, ISampleEvent } from '../../../src/lib/data/interface';
import MusicTime from 'musictime';
import { IPoint, ISize } from '../../../src/lib/editor/Editor';

export function createSequenceElement(
  sequence: ISequence,
  position: IPoint,
  size: ISize,
  color: string,
  labelHeight: number,
  pixelsPerSecond: number,
  bpm: number,
  eventWidth: number,
  eventVerticalSpread = 3,
): HTMLElement {
  const wrapper = createRectElement(position, size, color);

  const label = document.createElement('p');
  label.innerText = sequence.id;
  label.style.margin = '0px';
  label.style.padding = '1px 4px';
  label.style.height = `${labelHeight}px`;
  label.style.backgroundColor = 'rgba(0,0,0,0.4)';
  label.style.color = 'white';
  label.style.boxSizing = 'border-box';
  label.style.fontSize = '11px';
  wrapper.appendChild(label);

  const eventWrapHeight = size.height - labelHeight;
  const eventWrap = document.createElement('div');
  eventWrap.style.height = `${eventWrapHeight}px`;
  eventWrap.style.position = 'relative';
  wrapper.appendChild(eventWrap);

  const eventHeight = eventWrapHeight / eventVerticalSpread;
  sequence.events.forEach((event, index) => {
    const pos = {
      x: musicTimeToPixels(event.relativeStart, bpm, pixelsPerSecond),
      y: (index % eventVerticalSpread) * eventHeight,
    };
    const size = {
      width: eventWidth - 1,
      height: eventHeight - 1,
    };

    const eventEl = createRectElement(pos, size, 'rgba(255,255,255,1)');
    eventEl.innerText = (<ISampleEvent>event).sampleName[0];
    eventEl.title = (<ISampleEvent>event).sampleName;
    eventWrap.appendChild(eventEl);
  });

  return wrapper;
}

export function createSection(section: ISection, position: IPoint, size: ISize): HTMLElement {
  const wrapper = createRectElement(position, size, '#00cc00');

  // const label = document.createElement('p');
  // label.innerText = 'section';
  // label.style.margin = '0px';
  // label.style.padding = '2px';
  // label.style.backgroundColor = 'rgba(0,0,0,0.4)';
  // label.style.color = 'white';
  // label.style.fontSize = '11px';
  // wrapper.appendChild(label);

  return wrapper;
}

export function createRectElement(position: IPoint, size: ISize, color: string): HTMLElement {
  const el = document.createElement('div');
  el.style.width = `${size.width}px`;
  el.style.height = `${size.height}px`;
  el.style.left = `${position.x}px`;
  el.style.top = `${position.y}px`;
  el.style.position = `absolute`;
  el.style.backgroundColor = color;

  return el;
}

export function createTimelineCanvas(
  parent: HTMLElement,
  height: number,
  yOffset: number,
): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  const timeLineContext = canvas.getContext('2d');
  canvas.width = parseInt(parent.style.width, 10);
  canvas.height = height;
  canvas.style.position = 'absolute';
  canvas.style.top = `${yOffset}px`;

  parent.appendChild(canvas);
  return timeLineContext;
}

export function drawTimeline(
  context: CanvasRenderingContext2D,
  xDrawOffset: number,
  pixelsPerSecond: number,
  bpm: number,
): void {
  context.fillStyle = 'black';
  context.strokeStyle = 'white';
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  const beatWidth = new MusicTime(0, 1, 0).toTime(bpm) * pixelsPerSecond;
  let xPosition = xDrawOffset;
  let index = 0;

  while (xPosition < context.canvas.width) {
    context.beginPath();
    const x = Math.round(xPosition) + 0.5;
    context.moveTo(x, context.canvas.height);

    let lineWidth = 0.5;
    let lineLength = 0.25;

    // if (index % 4 === 0) {
    //   lineWidth = 2;
    //
    // }
    if (index % 4 === 0) {
      lineWidth = 2;
      lineLength = 0.4;
    }

    const lineEndY = context.canvas.height - context.canvas.height * lineLength;
    context.lineTo(x, lineEndY);
    context.lineWidth = lineWidth;
    context.stroke();

    if (lineWidth === 2) {
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.fillText(new MusicTime(0, index, 0).toString(), x, lineEndY - 3);
    }

    xPosition += beatWidth;
    index += 1;
  }
}

export function musicTimeToPixels(musicTime: MusicTime, bpm, pixelsPerSecond): number {
  return musicTime.toTime(bpm) * pixelsPerSecond;
}

export function createVerticalLine(height: number, pos: IPoint, color: string): HTMLElement {
  const div = document.createElement('div');

  div.style.width = `${1}px`;
  div.style.height = `${height}px`;
  div.style.left = `${pos.x}px`;
  div.style.top = `${pos.y}px`;
  div.style.position = 'absolute';
  div.style.zIndex = '999';
  div.style.backgroundColor = color;

  return div;
}
