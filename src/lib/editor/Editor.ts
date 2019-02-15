import Song from '../Song';
// import { getLatestEventInSequence } from '../util/sequenceUtils';
import { ISequence, ITimedSequence, ISection, SequenceEvent } from '../data/interface';
import MusicTime from 'musictime';
import {
  createSequenceElement,
  drawTimeline,
  createTimelineCanvas,
  createSection,
  musicTimeToPixels,
  createVerticalLine,
  createEventElement,
  applyPosAndSize,
} from '../util/editorUtils';
import AnimationFrame from '../util/AnimationFrame';
import SongPlayer from '../SongPlayer';
import { getLatestEventInSequence } from '../util/sequenceUtils';

export default class Editor {
  private minMaxPixelsPerSecond = [30, 500];
  private pixelsPerSecond = 40;
  private defaultEventDuration = MusicTime.fromString('0.0.1');
  private sequenceHeight = 70;
  private colors = ['#b3d9ff', '#66b3ff'];
  private seqsOffset: IPoint = { x: 30, y: 110 };
  private seqLabelheight = 15;
  private seqSpacing: IPoint = { x: 1, y: 1 };
  private timelineHeight = 30;
  private timelineSpacing = 40;
  private eventVerticalSpread = 3;

  private element: HTMLElement;
  private timeLineContext: CanvasRenderingContext2D;
  private song!: Song;
  private player: SongPlayer;
  private playHead: HTMLElement;
  private songEnd: HTMLElement;
  private updateFrame: AnimationFrame = new AnimationFrame(this.onUpdate.bind(this));
  private elementsMap = new Map();

  constructor(element: HTMLElement, player: SongPlayer) {
    this.element = element;
    element.style.position = 'relative';
    element.style.backgroundColor = '#444';
    element.style.overflow = 'hidden';

    this.player = player;

    // todo
    // player.addEventListener('state-change', (event: SequencePlayerEvent) => {
    //   switch (event.data) {
    //     case SequencePlayerState.IDLE: {
    //       this.updateFrame.stop();
    //       this.updatePlayheadPosition();
    //       break;
    //     }
    //     case SequencePlayerState.PLAYING: {
    //       this.updateFrame.start();
    //       break;
    //     }
    //   }
    // });

    // playhead
    const x = this.seqsOffset.x + this.player.timeData.playTime * this.pixelsPerSecond;
    const y = this.seqsOffset.y;
    this.playHead = createVerticalLine(0, { x, y }, 'red'); // height will be set later
    this.element.appendChild(this.playHead);

    // song end
    this.songEnd = createVerticalLine(0, { x, y }, 'lime'); // height will be set later
    this.element.appendChild(this.songEnd);

    this.timeLineContext = createTimelineCanvas(
      element,
      this.timelineHeight,
      this.seqsOffset.y - this.timelineHeight - this.timelineSpacing,
    );
  }

  public setPixelsPerSecondFactor(value: number): void {
    this.pixelsPerSecond =
      this.minMaxPixelsPerSecond[0] +
      value * (this.minMaxPixelsPerSecond[1] - this.minMaxPixelsPerSecond[0]);

    drawTimeline(this.timeLineContext, this.seqsOffset.x, this.pixelsPerSecond, this.song);
    this.drawSong();
    this.positionSongEnd();
  }

  private onUpdate(): void {
    this.updatePlayheadPosition();
  }

  setSong(song: Song): void {
    this.song = song;
    this.drawSong();
    this.setLineHeights();
    drawTimeline(this.timeLineContext, this.seqsOffset.x, this.pixelsPerSecond, this.song);
    this.positionSongEnd();
  }

  private positionSongEnd(): void {
    this.songEnd.style.left = `${this.seqsOffset.x +
      musicTimeToPixels(this.song.getTimelineEnd()!, this.song.bpm, this.pixelsPerSecond)}px`;
  }

  private drawSong(): void {
    // sequences
    this.song.timedSequences.forEach(timedSequence => {
      const sequenceIndex = this.song.sequences.indexOf(timedSequence.sequence);
      const existingElement = this.elementsMap.get(timedSequence);

      const pos = this.getPositionForTimesSequence(timedSequence, sequenceIndex);
      const size = this.getSizeForTimedSequence(timedSequence);
      if (existingElement) {
        // element already exists, resize/reposition
        applyPosAndSize(existingElement, pos, size);

        this.updateEventsPosition(existingElement);
      } else {
        // element doesnt exist, create new
        const label = `${timedSequence.id}: ${
          timedSequence.sequence.id
        } (${timedSequence.absoluteStart.toString()})`;
        const el = createSequenceElement(
          label,
          pos,
          size,
          this.colors[sequenceIndex % 2],
          this.seqLabelheight,
        );

        this.element.appendChild(el);
        this.addEventsToSequence(el, timedSequence);

        this.elementsMap.set(timedSequence, el);
      }
    });

    // draw sections
    const sections = this.song.getSections();
    sections.forEach((section, index) => {
      const existingElement = this.elementsMap.get(section);
      const pos = this.getSectionPosition(section, index);
      const size = this.getSectionSize(section);
      if (existingElement) {
        applyPosAndSize(existingElement, pos, size);
      } else {
        const el = createSection(section, pos, size);
        this.elementsMap.set(section, el);
        this.element.appendChild(el);
      }
    });
  }

  private updateEventsPosition(sequenceElement: HTMLElement): void {
    const elements = Array.from(sequenceElement.querySelectorAll('.events div')) as HTMLElement[];
    elements.forEach((el, index) => {
      const event = this.elementsMap.get(el);
      const size = this.getEventSize(event);
      const pos = this.getPositionForEvent(event, index, size.height);
      el.style.left = `${pos.x}px`;
      el.style.top = `${pos.y}px`;
      el.style.width = `${size.width}px`;
      el.style.height = `${size.height}px`;
    });
  }

  private getEventContainerHeight(): number {
    return this.sequenceHeight - this.seqLabelheight;
  }

  private addEventsToSequence(sequenceElement: HTMLElement, timedSequence: ITimedSequence): void {
    const eventsContainer = sequenceElement.querySelector('.events');

    if (!eventsContainer) {
      throw new Error('eventsContainer element not found');
    }

    timedSequence.sequence.events.forEach((event, index) => {
      const eventSize = this.getEventSize(event);
      const eventEl = createEventElement(
        event,
        this.getPositionForEvent(event, index, eventSize.height),
        eventSize,
        timedSequence,
        this.song.bpm,
      );
      eventEl.style.overflow = 'hidden';
      eventEl.style.fontSize = '10px';
      eventsContainer.appendChild(eventEl);

      // store eventdata for element
      this.elementsMap.set(eventEl, event);
    });
  }

  private getPositionForEvent(event: SequenceEvent, index: number, eventHeight: number): IPoint {
    return {
      x: this.musicTimeToPixels(event.relativeStart),
      y: (index % this.eventVerticalSpread) * eventHeight,
    };
  }

  private getEventSize(event: SequenceEvent): ISize {
    return {
      width: this.musicTimeToPixels(event.relativeEnd.subtract(event.relativeStart)) - 1,
      height: this.getEventContainerHeight() / this.eventVerticalSpread - 1,
    };
  }

  private getSectionPosition(section: ISection, index: number): IPoint {
    return {
      x: this.seqsOffset.x + this.musicTimeToPixels(section.start),
      y: this.seqsOffset.y - 40 + (index % 2) * 11,
    };
  }

  private getSectionSize(section: ISection): ISize {
    return {
      width: this.musicTimeToPixels(section.end.subtract(section.start)),
      height: 10,
    };
  }

  private getPositionForTimesSequence(timedSequence: ITimedSequence, index: number): IPoint {
    return {
      x: this.seqsOffset.x + this.musicTimeToPixels(timedSequence.absoluteStart),
      y: this.seqsOffset.y + index * (this.sequenceHeight + this.seqSpacing.y),
    };
  }

  private getSizeForTimedSequence(timedSequence: ITimedSequence): ISize {
    return {
      width: this.getSequenceWidth(timedSequence.sequence) - this.seqSpacing.x,
      height: this.sequenceHeight,
    };
  }

  private updatePlayheadPosition(): void {
    const x = this.seqsOffset.x + this.player.timeData.playTime * this.pixelsPerSecond;
    this.playHead.style.left = `${x}px`;
  }

  private setLineHeights(): void {
    const height =
      this.song.sequences.length * (this.sequenceHeight + this.seqSpacing.y) - this.seqSpacing.y;
    this.playHead.style.height = `${height}px`;
    this.songEnd.style.height = `${height}px`;
  }

  private getSequenceWidth(sequence: ISequence): number {
    const latestEvent = getLatestEventInSequence(sequence);
    if (!latestEvent) {
      throw new Error('No latest event found');
    }

    // ceil to next bar
    const seqEndTime = latestEvent.relativeStart.add(new MusicTime(0, 1, 0));

    return this.musicTimeToPixels(seqEndTime);
    // return this.musicTimeToPixels(seqEndTime) + this.getEventSize().width + 1;
  }

  private musicTimeToPixels(musicTime: MusicTime): number {
    return musicTimeToPixels(musicTime, this.song.bpm, this.pixelsPerSecond);
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
