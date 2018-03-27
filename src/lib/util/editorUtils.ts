import { ISequence } from '../../../src/lib/data/interface';

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
  label.style.padding = '3px 6px';
  label.style.backgroundColor = 'black';
  label.style.color = 'white';
  label.style.fontSize = '11px';
  wrapper.appendChild(label);

  return wrapper;
}
