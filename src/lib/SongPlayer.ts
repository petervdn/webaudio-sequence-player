import { clearAllLastScheduleData, getEventScheduleList } from './util/scheduleUtils';
import Song from './Song';
import Interval from './util/Interval';
import EventDispatcher from 'seng-event';
import {
  IScheduleEventData,
  IScheduleTiming,
  ISection,
  ISongPlayerTimeData,
} from './data/interface';
import { getSectionOnTime } from './util/songUtils';
import AnimationFrame from './util/AnimationFrame';
import MusicTime from 'musictime';
import { initTimeData } from './util/sequencePlayerUtils';
import { SongPlayerEvent } from './SongPlayerEvent';
import { SongPlayerState } from './data/enum';

export default class SongPlayer extends EventDispatcher {
  public timeData: ISongPlayerTimeData = initTimeData();

  private state: SongPlayerState = SongPlayerState.IDLE;
  private context: AudioContext;
  private playStartTime: number = -1;
  private scheduleTime: IScheduleTiming = { interval: 1, lookAhead: 1.5 };
  private scheduleInterval: Interval;
  private timeDataUpdater: AnimationFrame;
  private song: Song | undefined;
  private currentSection: ISection | undefined;

  constructor(context: AudioContext) {
    super();

    this.context = context;

    this.scheduleInterval = new Interval(this.onScheduleInterval, this.scheduleTime.interval);
    this.timeDataUpdater = new AnimationFrame(this.onTimeDataUpdate);
  }

  /**
   * Sets the state and dispatches an event.
   * @param {SequencePlayerState} state
   */
  private setState(state: SongPlayerState): void {
    if (state !== this.state) {
      this.state = state;
      this.dispatchEvent(new SongPlayerEvent(SongPlayerEvent.STATE_CHANGE));
    }
  }

  /**
   * Loads all samples in a song, and sets a reference to the sample on all SampleEvents in each sequence.
   * @param {Song} song
   * @param {() => void} onProgress
   * @returns {Promise<void>}
   */
  // public loadSong(song: Song, onProgress?: () => void): Promise<void> {
  //   if (this.state !== SequencePlayerState.IDLE) {
  //     return Promise.reject('Can only load when idle');
  //   }
  //
  //   this.setState(SequencePlayerState.LOADING);
  //
  //   return this.sampleManager
  //     .loadSamplesByName(song.getUsedSampleNames(), onProgress)
  //     .then(() => {
  //       setSamplesOnSampleEvents(song, this.sampleManager);
  //       this.setState(SequencePlayerState.IDLE);
  //     })
  //     .catch(e => {
  //       this.setState(SequencePlayerState.IDLE);
  //       return Promise.reject(e);
  //     });
  // }

  /**
   * Play a song at the given bpm.
   * @param {Song} song
   * @param {number} startTime
   * @param {boolean} updateTimeData
   */
  public play(song: Song, startTime = 0, updateTimeData = true): void {
    // todo add play with timeoffset (related to pause)
    if (this.state !== SongPlayerState.IDLE) {
      console.error('Can only play when idle');
      return;
    }

    if (!song) {
      throw new Error('No song given');
    }

    this.song = song;

    if (!this.song.getIsLoaded()) {
      throw new Error('Song is not loaded');
    }

    // set the initial section // todo what happens with multiple sections here
    this.currentSection = getSectionOnTime(song, startTime);

    if (!this.currentSection) {
      throw new Error(`No section found for time ${startTime}`);
    }

    this.currentSection.startedAt = 0;

    // let loadPromise: Promise<void>;
    // if (this.song.getIsLoaded()) {
    //   loadPromise = Promise.resolve();
    // } else {
    //   // todo after loading, state quickly jumps to idle (and then to playing)
    //   loadPromise = this.loadSong(this.song);
    // }

    this.setState(SongPlayerState.PLAYING);
    // store start time, so we know where we are in the song
    this.playStartTime = this.context.currentTime;

    // start timedata updater
    if (updateTimeData) {
      this.timeDataUpdater.start();
    }

    // do one schedule call for time=0
    // todo this can give an error, when the moment comes the sampleplayer needs to play
    // that time is already 0.000001 s in the past.
    this.scheduleAtTime(this.song, 0);

    // and more on interval
    this.scheduleInterval.start();
  }

  private onScheduleInterval = () => {
    this.scheduleAtTime(this.song!, this.getSongPlayTime());
  };

  private onTimeDataUpdate = () => {
    const songPlayTime = this.getSongPlayTime();
    this.timeData = {
      playTime: songPlayTime,
      playMusicTime: MusicTime.fromTime(songPlayTime, this.song!.bpm),
    };
  };

  /**
   * Retrieves and schedules all events from time to time+lookahead
   * @param {Song} song
   * @param {number} time
   * @param {number} lookAheadTime
   */
  public scheduleAtTime(song: Song, time: number, lookAheadTime?: number): void {
    // const reachedEnd = this.checkSection(time);

    // get all events in the timewindow
    const endTime = time + (lookAheadTime || this.scheduleTime.lookAhead);
    const items: IScheduleEventData[] = getEventScheduleList(
      song,
      time,
      endTime,
      this.currentSection!,
    );

    items.forEach(item => {
      // this.samplePlayer.playSample(item, this.playStartTime); todo
    });
  }

  // private checkSection(time: number): boolean {
  //   const sectionIteration = getSectionIterationAtTime(this.currentSection, time, this.song.bpm);
  //
  //   if (this.currentSection.repeat > -1 && sectionIteration > this.currentSection.repeat) {
  //     return true;
  //   }
  //
  //   return false;
  // }

  public stop(): void {
    if (this.state !== SongPlayerState.PLAYING) {
      console.error('Can only stop when playing');
      return;
    }
    this.scheduleInterval.stop();
    // this.samplePlayer.stopAll();
    this.timeDataUpdater.stop();
    this.timeData = initTimeData();
    clearAllLastScheduleData(this.song!);
    this.setState(SongPlayerState.IDLE);
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
  public getState(): SongPlayerState {
    return this.state;
  }

  public dispose() {
    // todo
    super.dispose();
  }
}
