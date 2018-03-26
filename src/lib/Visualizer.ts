import Song from './Song';
import MusicTime from 'musictime/lib/MusicTime';
import { ISequence } from './data/interface';
import { getLatestEventInSequence } from './util/sequenceUtils';
import AnimationFrame from './util/AnimationFrame';
import SequencePlayer from './SequencePlayer';

export default class Visualizer {
  private context: CanvasRenderingContext2D;
  private player: SequencePlayer;
  private size: ISize;
  private song: Song;
  private pixelPerSixteenth = 5;
  private sequenceHeight = 50;
  private colors = ['#b3d9ff', '#66b3ff'];
  private seqsOffset: IPoint = { x: 50, y: 50 };
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
    this.drawSeqIds();
  }

  private drawPlayhead(): void {
    const time = this.player.timeData.playMusicTime;
    const x = this.seqsOffset.x + time.toSixteenths() * this.pixelPerSixteenth;
    this.context.beginPath();
    this.context.moveTo(x, this.seqsOffset.y);
    this.context.lineTo(x, this.seqsOffset.y + this.song.sequences.length * this.sequenceHeight);
    this.context.strokeStyle = 'rgba(255,255,255,0.5';
    this.context.stroke();
    this.context.closePath();
  }

  private drawSequences(): void {
    this.song.timedSequences.forEach(timedSequence => {
      const sequenceIndex = this.song.sequences.indexOf(timedSequence.sequence);

      // fill seq rect
      const x = this.seqsOffset.x + this.musicTimeToPixels(timedSequence.absoluteStart);
      const y = this.seqsOffset.y + sequenceIndex * this.sequenceHeight;
      const width = this.getSequenceWidth(timedSequence.sequence);
      const height = this.sequenceHeight;

      this.context.fillStyle = this.colors[sequenceIndex % 2];
      this.context.fillRect(x, y, width, height);

      // vertical line to the left
      this.context.lineWidth = 2;
      this.context.beginPath();
      this.context.moveTo(x, y);
      this.context.lineTo(x, y + height);
      this.context.strokeStyle = 'black';
      this.context.stroke();
      this.context.closePath();
    });
  }

  private drawSeqIds(): void {
    this.song.sequences.forEach((seq, index) => {
      // id
      this.context.font = '16px monospace';
      this.context.textAlign = 'right';
      this.context.fillStyle = 'white';
      this.context.fillText(
        seq.id,
        this.seqsOffset.x - 10,
        this.seqsOffset.y + index * this.sequenceHeight + 20,
      );
    });
  }

  private musicTimeToPixels(musicTime: MusicTime): number {
    return musicTime.toSixteenths() * this.pixelPerSixteenth;
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
