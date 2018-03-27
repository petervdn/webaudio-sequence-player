import Song from './Song';
import MusicTime from 'musictime/lib/MusicTime';
import { ISequence } from './data/interface';
import { getLatestEventInSequence } from './util/sequenceUtils';
import AnimationFrame from './util/AnimationFrame';
import SequencePlayer from './SequencePlayer';

export default class Visualizer {
  private pixelsPerSecond = 30;
  private sequenceHeight = 50;
  private colors = ['#b3d9ff', '#66b3ff'];
  private seqsOffset: IPoint = { x: 50, y: 50 };
  private seqIdHeight = 15;
  private seqSpacing: IPoint = { x: 2, y: 2 };

  private context: CanvasRenderingContext2D;
  private player: SequencePlayer;
  private size: ISize;
  private song: Song;
  private render: AnimationFrame = new AnimationFrame(this.draw.bind(this));

  constructor(canvas: HTMLCanvasElement, player: SequencePlayer) {
    this.context = canvas.getContext('2d');
    this.player = player;
    this.size = {
      width: canvas.width,
      height: canvas.height,
    };
  }

  public setSong(song: Song): void {
    this.song = song;
    this.render.start();
  }

  public draw(): void {
    this.context.fillStyle = '#444';
    this.context.fillRect(0, 0, this.size.width, this.size.height);

    this.drawSequences();
    this.drawPlayhead();
  }

  private drawPlayhead(): void {
    const x = this.seqsOffset.x + this.player.timeData.playTime * this.pixelsPerSecond;

    this.context.beginPath();
    this.context.moveTo(x, this.seqsOffset.y);
    this.context.lineTo(
      x,
      this.seqsOffset.y +
        this.song.sequences.length * (this.sequenceHeight + this.seqSpacing.y) -
        this.seqSpacing.y,
    );
    this.context.strokeStyle = 'rgba(255,0,0,1)';
    this.context.stroke();
    this.context.closePath();
  }

  private drawSequences(): void {
    this.song.timedSequences.forEach(timedSequence => {
      const sequenceIndex = this.song.sequences.indexOf(timedSequence.sequence);

      // seq
      const x = this.seqsOffset.x + this.musicTimeToPixels(timedSequence.absoluteStart);
      const y = this.seqsOffset.y + sequenceIndex * (this.sequenceHeight + this.seqSpacing.y);
      const width = this.getSequenceWidth(timedSequence.sequence) - this.seqSpacing.x;
      const height = this.sequenceHeight;

      // fill seq rect
      this.context.fillStyle = this.colors[sequenceIndex % 2];
      this.context.fillRect(x, y, width, height);

      // seq id bg
      this.context.fillStyle = 'black';
      this.context.fillRect(x, y, width, this.seqIdHeight);

      // seq id
      this.context.font = '10px monospace';
      this.context.fillStyle = 'white';
      this.context.fillText(timedSequence.sequence.id, x + 4, y + 11);
    });
  }

  private musicTimeToPixels(musicTime: MusicTime): number {
    // return musicTime.toSixteenths() * this.pixelPerSixteenth;
    return musicTime.toTime(this.song.bpm) * this.pixelsPerSecond;
  }

  private getSequenceWidth(sequence: ISequence): number {
    const latestEvent = getLatestEventInSequence(sequence);
    // ceil to next bar
    const seqEndTime = new MusicTime(latestEvent.relativeStart.bars + 1, 0, 0);

    return this.musicTimeToPixels(seqEndTime);
  }
}

interface ISize {
  width: number;
  height: number;
}

interface IPoint {
  x: number;
  y: number;
}
