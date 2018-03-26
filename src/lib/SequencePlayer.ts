import { clearAllLastScheduleData, getEventScheduleList } from './util/scheduleUtils';
import Song from './Song';
import Interval from './util/Interval';
import SampleManager from 'sample-manager';
import EventDispatcher from 'seng-event';
import { IScheduleEventData, IScheduleTiming } from './data/interface';
import { setSamplesOnSampleEvents } from './util/songUtils';
import SamplePlayer from './SamplePlayer';
import { SequencePlayerState } from './data/enum';
import { SequencePlayerEvent } from './data/event';

export default class SequencePlayer extends EventDispatcher {
  public sampleManager: SampleManager;
  public samplePlayer: SamplePlayer;

  private state: SequencePlayerState = SequencePlayerState.IDLE;
  private context: AudioContext;
  private playStartTime: number;
  private scheduleTime: IScheduleTiming = { interval: 1, lookAhead: 1.5 };
  private scheduleInterval: Interval;
  private song: Song;

  constructor(context: AudioContext, samplesBasePath: string, samplesExtension: string) {
    super();

    this.context = context;
    // todo allow external sample manager?
    this.sampleManager = new SampleManager(this.context, samplesBasePath, samplesExtension);
    this.samplePlayer = new SamplePlayer(this.context, this.context.destination);

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
   * Loads all samples in a song, and sets a reference to the sample on all SampleEvents in each sequence.
   * @param {Song} song
   * @param {string} extension
   * @param {() => void} onProgress
   * @returns {Promise<void>}
   */
  public loadSong(song: Song, onProgress?: () => void): Promise<void> {
    if (this.state !== SequencePlayerState.IDLE) {
      return Promise.reject('Can only load when idle');
    }

    this.setState(SequencePlayerState.LOADING);

    return this.sampleManager
      .loadSamplesByName(song.getUsedSampleNames(), onProgress)
      .then(() => {
        setSamplesOnSampleEvents(song, this.sampleManager);
        this.setState(SequencePlayerState.IDLE);
      })
      .catch(e => {
        this.setState(SequencePlayerState.IDLE);
        return Promise.reject(e);
      });
  }

  /**
   * Play a song at the given bpm.
   * @param {Song} song
   * @param {number} bpm
   * @param {PlayMode} playMode
   */
  public play(song: Song): void {
    // todo return promise?
    if (this.state !== SequencePlayerState.IDLE) {
      console.error('Can only play when idle');
      return;
    }

    this.song = song;

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

      // do one schedule call for time=0
      this.scheduleAtTime(0);

      // and more on interval
      this.scheduleInterval.start();
    });
  }

  private onScheduleInterval = () => {
    this.scheduleAtTime(this.getSongPlayTime());
  };

  /**
   * Schedules all events from time to time+lookahead
   * @param {number} playTime
   */
  public scheduleAtTime(playTime: number): void {
    // get all events in the timewindow
    const endTime = playTime + this.scheduleTime.lookAhead;
    const items: IScheduleEventData[] = getEventScheduleList(playTime, endTime, this.song);

    items.forEach(item => {
      //
      this.samplePlayer.playSample(item, this.playStartTime);
    });
  }

  public stop(): void {
    if (this.state !== SequencePlayerState.PLAYING) {
      console.error('Can only stop when playing');
      return;
    }
    this.scheduleInterval.stop();
    this.samplePlayer.stopAll();
    clearAllLastScheduleData(this.song);
    this.setState(SequencePlayerState.IDLE);
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
    // todo
    super.dispose();
  }
}
//
// export class SequencePlayerEvent extends AbstractEvent {
//   public static STATE_CHANGE:string = EVENT_TYPE_PLACEHOLDER;
// }
