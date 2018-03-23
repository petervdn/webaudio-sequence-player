import { getSequenceEvents } from './schedulerUtils';
import Song from './Song';
import { PlayMode } from './enum';
import Interval from './Interval';
import SampleManager from 'sample-manager';
import EventDispatcher from 'seng-event';
import AbstractEvent from 'seng-event/lib/AbstractEvent';

export default class SequencePlayer extends EventDispatcher {
  public sampleManager: SampleManager;

  private state: SequencePlayerState = SequencePlayerState.IDLE;
  private context: AudioContext;
  private playStartTime: number;
  private scheduleInterval: Interval;
  private scheduleIntervalTime = 1;
  private lookAheadTime = 1.5;
  private bpm: number;
  private song: Song;
  private playMode: PlayMode;

  constructor(context: AudioContext, sampleManager?: SampleManager) {
    super();

    this.context = context;
    this.sampleManager = sampleManager || new SampleManager(this.context);

    this.scheduleInterval = new Interval(this.onScheduleInterval, this.scheduleIntervalTime);
  }

  private setState(state: SequencePlayerState): void {
    if (state !== this.state) {
      this.state = state;
      this.dispatchEvent(new SequencePlayerEvent('state-change', this.state));
    }
  }

  public loadSong(song: Song, extension: string, onProgress?: () => void): Promise<void> {
    return this.sampleManager.loadSamplesByName(song.getUsedSampleNames(), extension, onProgress);
  }

  public play(song: Song, bpm: number, playMode: PlayMode): void {
    if (this.state !== SequencePlayerState.IDLE) {
      console.error('Can only play when idle');
      return;
    }

    this.setState(SequencePlayerState.PLAYING);
    console.log(song.getIsLoaded());

    this.song = song;
    this.bpm = bpm;
    this.playMode = playMode;

    // store starttime, so we know where we are in the song
    this.playStartTime = this.context.currentTime;

    switch (this.playMode) {
      case PlayMode.ONCE: {
        break;
      }
      case PlayMode.LIVE: {
        // do one schedule call for time=0
        this.scheduleAtTime(0);

        // and more on interval
        this.scheduleInterval.start();
        break;
      }
      default: {
        throw new Error(`Unknown playmode ${this.playMode}`);
      }
    }
  }

  onScheduleInterval = () => {
    this.scheduleAtTime(this.getSongPlayTime());
  };

  private scheduleAtTime(playTime: number): void {
    const events = getSequenceEvents(playTime, playTime + this.lookAheadTime, this.song);
  }

  public stop(): void {
    if (this.state !== SequencePlayerState.PLAYING) {
      console.error('Can only stop when playing');
      return;
    }
    this.setState(SequencePlayerState.IDLE);

    switch (this.playMode) {
      case PlayMode.ONCE: {
        break;
      }
      case PlayMode.LIVE: {
        this.scheduleInterval.stop();
        break;
      }
      default: {
        throw new Error(`Unknown playmode ${this.playMode}`);
      }
    }
  }

  /**
   * Returns the time in seconds that the song is playing.
   * @returns {number}
   */
  public getSongPlayTime(): number {
    return this.context.currentTime - this.playStartTime;
  }

  public getState(): SequencePlayerState {
    return this.state;
  }

  public dispose() {
    super.dispose();
  }
}
//
// export class SequencePlayerEvent extends AbstractEvent {
//   public static STATE_CHANGE:string = EVENT_TYPE_PLACEHOLDER;
// }

export class SequencePlayerEvent extends AbstractEvent {
  public data: any;

  constructor(
    type: string,
    data?: any,
    bubbles: boolean = false,
    cancelable: boolean = false,
    setTimeStamp: boolean = false,
  ) {
    super(type, bubbles, cancelable, setTimeStamp);
    this.data = data;
  }

  public clone(): SequencePlayerEvent {
    return new SequencePlayerEvent(
      this.type,
      this.data,
      this.bubbles,
      this.cancelable,
      this.timeStamp !== 0,
    );
  }
}

export enum SequencePlayerState {
  IDLE = 'idle',
  LOADING = 'loading',
  PLAYING = 'playing',
}
