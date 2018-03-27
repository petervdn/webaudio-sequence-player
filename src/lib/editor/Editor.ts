import Song from '../Song';
import { getLatestEventInSequence } from '../util/sequenceUtils';
import { ISequence } from '../data/interface';
import MusicTime from 'musictime';
import { createSequenceElement, drawTimeline, createTimelineCanvas } from '../util/editorUtils';
import { SequencePlayerEvent } from '../data/event';
import AnimationFrame from '../util/AnimationFrame';
import { SequencePlayerState } from '../data/enum';
import SequencePlayer from '../SequencePlayer';

export default class Editor {
  private pixelsPerSecond = 30;
  private sequenceHeight = 50;
  private colors = ['#b3d9ff', '#66b3ff'];
  private seqsOffset: IPoint = { x: 50, y: 50 };
  private seqIdHeight = 15;
  private seqSpacing: IPoint = { x: 2, y: 2 };
  private timelineHeight = 30;

  private element: HTMLElement;
  private timeLineContext: CanvasRenderingContext2D;
  private song: Song;
  private size: ISize;
  private player: SequencePlayer;
  private playHead: HTMLElement;
  private updateFrame: AnimationFrame = new AnimationFrame(this.onUpdate.bind(this));

  constructor(element: HTMLElement, player: any) {
    this.element = element;
    element.style.position = 'relative';
    element.style.backgroundColor = '#444';

    this.player = player;

    player.addEventListener('state-change', (event: SequencePlayerEvent) => {
      switch (event.data) {
        case SequencePlayerState.IDLE: {
          this.updateFrame.stop();
          this.updatePlayheadPosition();
          break;
        }
        case SequencePlayerState.PLAYING: {
          this.updateFrame.start();
          break;
        }
      }
    });

    this.playHead = this.createPlayhead();

    this.size = {
      width: parseInt(element.style.width, 10),
      height: parseInt(element.style.height, 10),
    };

    this.timeLineContext = createTimelineCanvas(
      element,
      this.timelineHeight,
      this.seqsOffset.y - this.timelineHeight,
    );
  }

  private onUpdate(): void {
    this.updatePlayheadPosition();
  }

  setSong(song: Song): void {
    this.song = song;
    this.drawSong();
    this.setPlayheadHeight();
    drawTimeline(this.timeLineContext, this.seqsOffset.x, this.pixelsPerSecond, this.song.bpm);
  }

  private drawSong(): void {
    this.song.timedSequences.forEach(timedSequence => {
      const sequenceIndex = this.song.sequences.indexOf(timedSequence.sequence);

      // seq
      const x = this.seqsOffset.x + this.musicTimeToPixels(timedSequence.absoluteStart);
      const y = this.seqsOffset.y + sequenceIndex * (this.sequenceHeight + this.seqSpacing.y);
      const width = this.getSequenceWidth(timedSequence.sequence) - this.seqSpacing.x;
      const height = this.sequenceHeight;

      const el = createSequenceElement(
        timedSequence.sequence,
        x,
        y,
        width,
        height,
        this.colors[sequenceIndex % 2],
      );

      this.element.appendChild(el);
    });
  }

  private updatePlayheadPosition(): void {
    const x = this.seqsOffset.x + this.player.timeData.playTime * this.pixelsPerSecond;
    this.playHead.style.left = `${x}px`;
  }

  private setPlayheadHeight(): void {
    const height =
      this.song.sequences.length * (this.sequenceHeight + this.seqSpacing.y) - this.seqSpacing.y;
    this.playHead.style.height = `${height}px`;
  }

  private createPlayhead(): HTMLElement {
    const div = document.createElement('div');
    const x = this.seqsOffset.x + this.player.timeData.playTime * this.pixelsPerSecond;
    const y = this.seqsOffset.y;

    div.style.width = '1px';
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.position = 'absolute';
    div.style.zIndex = '999';
    div.style.backgroundColor = 'red';

    this.element.appendChild(div);

    return div;
  }

  private getSequenceWidth(sequence: ISequence): number {
    const latestEvent = getLatestEventInSequence(sequence);
    // ceil to next bar
    const seqEndTime = new MusicTime(latestEvent.relativeStart.bars + 1, 0, 0);

    return this.musicTimeToPixels(seqEndTime);
  }

  private musicTimeToPixels(musicTime: MusicTime): number {
    // return musicTime.toSixteenths() * this.pixelPerSixteenth;
    return musicTime.toTime(this.song.bpm) * this.pixelsPerSecond;
  }
}

export interface ISize {
  width: number;
  height: number;
}

export interface IPoint {
  x: number;
  y: number;
}
