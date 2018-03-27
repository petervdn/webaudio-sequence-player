import { ISequence } from '../../../src/lib/data/interface';
import { IPoint } from '../../lib/editor/Editor';
import MusicTime from 'musictime/lib/MusicTime';

export function createSequenceElement(
  sequence: ISequence,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.style.left = `${x}px`;
  wrapper.style.top = `${y}px`;
  wrapper.style.position = `absolute`;
  wrapper.style.backgroundColor = color;

  const label = document.createElement('p');
  label.innerText = sequence.id;
  label.style.margin = '0px';
  label.style.padding = '2px';
  label.style.backgroundColor = 'rgba(0,0,0,0.4)';
  label.style.color = 'white';
  label.style.fontSize = '11px';
  wrapper.appendChild(label);

  return wrapper;
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
