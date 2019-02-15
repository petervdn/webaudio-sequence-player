import { ISongPlayerTimeData } from '../data/interface';
import MusicTime from 'musictime';

export function initTimeData(): ISongPlayerTimeData {
  return { playTime: 0, playMusicTime: new MusicTime(0, 0, 0) };
}
