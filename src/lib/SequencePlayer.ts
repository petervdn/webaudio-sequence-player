import { getSequenceEvents } from './schedulerUtils';
import Song from './Song';
import { PlayMode } from './enum';
import Interval from './Interval';
import SampleManager from 'sample-manager';
import EventDispatcher from 'seng-event';
import AbstractEvent from 'seng-event/lib/AbstractEvent';
import { IScheduleTiming } from './interface';

export default class SequencePlayer extends EventDispatcher {
  public sampleManager: SampleManager;

  private state: SequencePlayerState = SequencePlayerState.IDLE;
  private context: AudioContext;
  private playStartTime: number;
  private scheduleTime: IScheduleTiming = { interval: 1, lookAhead: 1.5 };
  private scheduleInterval: Interval;
  private bpm: number;
  private song: Song;
  private playMode: PlayMode;

  constructor(context: AudioContext, samplesBasePath: string, samplesExtension: string) {
    super();

    this.context = context;
    this.sampleManager = new SampleManager(this.context, samplesBasePath, samplesExtension);

    // create interval to start when scheduling
    this.scheduleInterval = new Interval(this.onScheduleInterval, this.scheduleTime.interval);
  }

  /**
   * Sets the state and dispatches an event.
   * @param {SequencePlayerState} state
   */
  private setState(state: SequencePlayerState): void {
    if (state !== this.state) {
      this.state = state;
      this.dispatchEvent(new SequencePlayerEvent('state-change', this.state));
    }
  }

  /**
   * Loads all samples in a song
   * @param {Song} song
   * @param {string} extension
   * @param {() => void} onProgress
   * @returns {Promise<void>}
   */
  public loadSong(song: Song, onProgress?: () => void): Promise<void> {
    if (this.state !== SequencePlayerState.IDLE) {
      console.error('Can only load when idle');
      return;
    }

    this.setState(SequencePlayerState.LOADING);

    return this.sampleManager.loadSamplesByName(song.getUsedSampleNames(), onProgress).then(() => {
      this.setState(SequencePlayerState.IDLE);
    });
  }

  /**
   * Play a song at the given bpm.
   * @param {Song} song
   * @param {number} bpm
   * @param {PlayMode} playMode
   */
  public play(song: Song, bpm: number, playMode: PlayMode): void {
    if (this.state !== SequencePlayerState.IDLE) {
      console.error('Can only play when idle');
      return;
    }

    this.song = song;
    this.bpm = bpm;
    this.playMode = playMode;

    let loadPromise: Promise<void>;
    if (song.getIsLoaded()) {
      loadPromise = Promise.resolve();
    } else {
      loadPromise = this.loadSong(song);
    }

    loadPromise.then(() => {
      this.setState(SequencePlayerState.PLAYING);

      // store start time, so we know where we are in the song
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
    });
  }

  onScheduleInterval = () => {
    this.scheduleAtTime(this.getSongPlayTime());
  };

  /**
   * Schedules all events from time to time+lookahead
   * @param {number} playTime
   */
  private scheduleAtTime(playTime: number): void {
    const endTime = playTime + this.scheduleTime.lookAhead;
    const events = getSequenceEvents(playTime, endTime, this.song, this.bpm);

    console.log('from', playTime, 'to', endTime);
    if (events.length) {
      events.forEach(event => console.log(event.absoluteStart.toTime(this.bpm), event));
    }
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

  /**
   * Returns the current state
   * @returns {SequencePlayerState}
   */
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
