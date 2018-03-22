import { getSequenceEvents } from './schedulerUtils';
import Song from './Song';
import { PlayMode } from './enum';
import Interval from './Interval';
import SampleManager from 'sample-manager';

export default class SequencePlayer {
  public sampleManager: SampleManager;

  private context: AudioContext;
  private playStartTime: number;
  private scheduleInterval: Interval;
  private scheduleIntervalTime = 1;
  private lookAheadTime = 1.5;
  private bpm: number;
  private song: Song;
  private isPlaying = false;
  private playMode: PlayMode;

  constructor(context: AudioContext, sampleManager?: SampleManager) {
    this.context = context;
    this.sampleManager = sampleManager || new SampleManager(this.context);

    this.scheduleInterval = new Interval(this.onScheduleInterval, this.scheduleIntervalTime);
  }

  public loadSong(song: Song, extension: string, onProgress?: () => void): Promise<void> {
    return this.sampleManager.loadSamplesByName(song.getUsedSampleNames(), extension, onProgress);
  }

  public play(song: Song, bpm: number, playMode: PlayMode): void {
    if (this.isPlaying) {
      console.error('Already playing');
      return;
    }

    console.log(song.getIsLoaded());
    this.isPlaying = true;

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
        console.error('Unknown playmode', this.playMode);
        this.isPlaying = false;
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
    if (!this.isPlaying) {
      return;
    }
    this.isPlaying = false;

    switch (this.playMode) {
      case PlayMode.ONCE: {
        break;
      }
      case PlayMode.LIVE: {
        this.scheduleInterval.stop();
        break;
      }
      default: {
        console.error('Unknown playmode', this.playMode);
      }
    }
  }

  /**
   * Returns the time in seconds that the song is playing.
   * @returns {number}
   */
  private getSongPlayTime(): number {
    return this.context.currentTime - this.playStartTime;
  }
}
