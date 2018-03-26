import { ISequencePlayerTimeData } from '../data/interface';
import MusicTime from 'musictime';

export function initTimeData(): ISequencePlayerTimeData {
  return { playTime: 0, playMusicTime: new MusicTime(0, 0, 0) };
}
