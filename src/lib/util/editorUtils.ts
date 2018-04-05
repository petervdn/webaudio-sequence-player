import { ISection, ISampleEvent, ISequenceEvent } from '../../../src/lib/data/interface';
import MusicTime from 'musictime';
import { IPoint, ISize } from '../../../src/lib/editor/Editor';
import Song from '../Song';

export function createSequenceElement(
  // sequence: ISequence,
  label: string,
  position: IPoint,
  size: ISize,
  color: string,
  labelHeight: number,
): HTMLElement {
  const wrapper = createRectElement(position, size, color);

  const labelEl = document.createElement('p');
  labelEl.innerText = label;
  labelEl.style.margin = '0px';
  labelEl.style.padding = '1px 4px';
  labelEl.style.height = `${labelHeight}px`;
  labelEl.style.backgroundColor = 'rgba(0,0,0,0.4)';
  labelEl.style.color = 'white';
  labelEl.style.boxSizing = 'border-box';
  labelEl.style.fontSize = '11px';
  labelEl.style.whiteSpace = 'nowrap';
  labelEl.style.overflow = 'hidden';
  wrapper.appendChild(labelEl);

  const eventWrapHeight = size.height - labelHeight;
  const eventWrap = document.createElement('div');
  eventWrap.classList.add('events');
  eventWrap.style.height = `${eventWrapHeight}px`;
  eventWrap.style.position = 'relative';
  wrapper.appendChild(eventWrap);

  return wrapper;
}

export function createEventElement(
  event: ISequenceEvent,
  position: IPoint,
  size: ISize,
): HTMLElement {
  const eventEl = createRectElement(position, size, 'rgba(255,255,255,1)');
  eventEl.innerText = (<ISampleEvent>event).sampleName;
  eventEl.title = `${(<ISampleEvent>event).sampleName} ${event.relativeStart.toString()}`;
  return eventEl;
}

export function createSection(section: ISection, position: IPoint, size: ISize): HTMLElement {
  const color = section.isGap ? 'rgba(0,0, 200,0.3' : 'rgba(0,200,0,0.3';
  if (section.isGap) {
    position.y -= 10;
  }
  return createRectElement(position, size, color);

  // const label = document.createElement('p');
  // label.innerText = 'section';
  // label.style.margin = '0px';
  // label.style.padding = '2px';
  // label.style.backgroundColor = 'rgba(0,0,0,0.4)';
  // label.style.color = 'white';
  // label.style.fontSize = '11px';
  // wrapper.appendChild(label);
}

export function createRectElement(position: IPoint, size: ISize, color: string): HTMLElement {
  const el = document.createElement('div');
  applyPosAndSize(el, position, size);
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
  song: Song,
): void {
  context.fillStyle = 'black';
  context.strokeStyle = 'white';
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  const beatWidth = new MusicTime(0, 1, 0).toTime(song.bpm) * pixelsPerSecond;
  let xPosition = xDrawOffset;
  let index = 0;

  while (xPosition < context.canvas.width) {
    context.beginPath();
    const x = Math.round(xPosition) + 0.5;
    context.moveTo(x, context.canvas.height);

    let lineWidth = 0.5;
    let lineLength = 0.25;

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
      const time = new MusicTime(0, index, 0);
      const label = `${time.toString()} (${time.toTime(song.bpm).toFixed(1)}s)`;
      context.fillText(label, x, lineEndY - 3);
    }

    xPosition += beatWidth;
    index += 1;
  }
}

export function applyPosAndSize(element: HTMLElement, pos: IPoint, size: ISize): void {
  element.style.left = `${pos.x}px`;
  element.style.top = `${pos.y}px`;
  element.style.width = `${size.width}px`;
  element.style.height = `${size.height}px`;
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
