import { clearAllLastScheduleData, getEventScheduleList } from './util/scheduleUtils';
import Song from './Song';
import Interval from './util/Interval';
import SampleManager from 'sample-manager';
import EventDispatcher from 'seng-event';
import {
  IScheduleEventData,
  IScheduleTiming,
  ISection,
  ISequencePlayerTimeData,
} from './data/interface';
import { setSamplesOnSampleEvents } from './util/songUtils';
import SamplePlayer from './SamplePlayer';
import { SequencePlayerState } from './data/enum';
import { SequencePlayerEvent } from './data/event';
import AnimationFrame from './util/AnimationFrame';
import { initTimeData } from './util/sequencePlayerUtils';
import MusicTime from 'musictime';

export default class SequencePlayer extends EventDispatcher {
  public sampleManager: SampleManager;
  public samplePlayer: SamplePlayer;
  public timeData: ISequencePlayerTimeData = initTimeData();

  private state: SequencePlayerState = SequencePlayerState.IDLE;
  private context: AudioContext;
  private playStartTime: number;
  private scheduleTime: IScheduleTiming = { interval: 1, lookAhead: 1.5 };
  private scheduleInterval: Interval;
  private timeDataUpdater: AnimationFrame;
  private song: Song;
  private currentSection: ISection;

  constructor(context: AudioContext, samplesBasePath: string, samplesExtension: string) {
    super();

    this.context = context;
    // todo allow external sample manager?
    this.sampleManager = new SampleManager(this.context, samplesBasePath, samplesExtension);
    this.samplePlayer = new SamplePlayer(this.context, this.context.destination);

    // create interval to start when scheduling
    this.scheduleInterval = new Interval(this.onScheduleInterval, this.scheduleTime.interval);
    this.timeDataUpdater = new AnimationFrame(this.onTimeDataUpdate);
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
   * Finds and sets the section for the given time. This selection is based on where the section
   * is on the timeline, and is always the first one (@0.0.0) unless playing is started from a certain time.
   * @param {Song} song
   * @param {number} time
   */
  private initFirstSection(song: Song, time: number): void {
    if (song.getSections().length) {
      this.currentSection = song
        .getSections()
        .find(
          section => time >= section.start.toTime(song.bpm) && time < section.end.toTime(song.bpm),
        );

      this.currentSection.startedAt = this.currentSection.start.clone();
      if (!this.currentSection) {
        throw new Error(`No section found for time ${time}`);
      }
    } else {
      this.currentSection = null;
    }
  }

  /**
   * Play a song at the given bpm.
   * @param {Song} song
   * @param {boolean} updateTimeData
   */
  public play(song: Song, updateTimeData = true): void {
    // todo add play with timeoffset (related to pause)
    // todo return promise?
    if (this.state !== SequencePlayerState.IDLE) {
      console.error('Can only play when idle');
      return;
    }

    if (!song) {
      throw new Error('No song given');
    }

    this.song = song;

    if (song.getSections().length) {
      this.initFirstSection(song, 0);
    }

    let loadPromise: Promise<void>;
    if (this.song.getIsLoaded()) {
      loadPromise = Promise.resolve();
    } else {
      // todo after loading, state quickly jumps to idle (and then to playing)
      loadPromise = this.loadSong(this.song);
    }

    loadPromise.then(() => {
      this.setState(SequencePlayerState.PLAYING);
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
    });
  }

  private onScheduleInterval = () => {
    // todo for now this is ok, but with loops songs can not have an end-time
    // todo also: this is not very precise
    if (this.getSongPlayTime() > this.song.getSongEndTime().toTime(this.song.bpm)) {
      this.stop();
    }
    this.scheduleAtTime(this.song, this.getSongPlayTime());
  };

  private onTimeDataUpdate = () => {
    const songPlayTime = this.getSongPlayTime();
    this.timeData = {
      playTime: songPlayTime,
      playMusicTime: MusicTime.fromTime(songPlayTime, this.song.bpm),
    };
  };

  /**
   * Retrieves and schedules all events from time to time+lookahead
   * @param {Song} song
   * @param {number} time
   * @param {number} lookAheadTime
   * @param {boolean} silent
   */
  public scheduleAtTime(song: Song, time: number, lookAheadTime?: number): void {
    // get all events in the timewindow
    const endTime = time + (lookAheadTime || this.scheduleTime.lookAhead);
    const items: IScheduleEventData[] = getEventScheduleList(
      song,
      time,
      endTime,
      this.currentSection,
    );

    items.forEach(item => {
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
    this.timeDataUpdater.stop();
    this.timeData = initTimeData();
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
