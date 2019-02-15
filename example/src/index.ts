import Editor from '../../src/lib/editor/Editor';
import { SongPlayer, Song, MusicTime, createSampleSequence } from '../../src';

import AnimationFrame from '../../src/lib/util/AnimationFrame';
import SampleManager from 'sample-manager/lib/SampleManager';

const notPlayingTime = '--.--.--';
const frame = new AnimationFrame(() => {
  musicTime = player.timeData.playMusicTime.toString();
});

const context = new AudioContext();
const sampleManager = new SampleManager(context, 'samples/', 'wav');
const player = new SongPlayer(context);
const editor = new Editor(document.querySelector('#editor') as HTMLElement, player);
sampleManager.addSamplesFromNames(['kick', 'clap', 'synth', 'snare', 'hihat']);
sampleManager.loadAllSamples().then(() => {
  console.log('done');
});
// player.addEventListener('state-change', event => {
//   switch (event.data) {
//     case SequencePlayerState.IDLE: {
//       musicTime = notPlayingTime;
//       frame.stop();
//       break;
//     }
//     case SequencePlayerState.PLAYING: {
//       frame.start();
//       break;
//     }
//   }
// });
// create a song
const song = new Song(120);

const seq1 = createSampleSequence('seq1', {
  '0.0.0': ['kick'],
  '0.1.0': ['snare'],
});
console.log(seq1);
song.addSequenceAtTime(seq1, new MusicTime(0, 0, 0));
song.addSequenceAtTime(seq1, new MusicTime(0, 2, 0));

// song.addSection(MusicTime.fromString('0.0.0'), MusicTime.fromString('1.0.0'));
console.log(song);
editor.setSong(song);

editor.setPixelsPerSecondFactor(0.5);
let musicTime: string = notPlayingTime;

(document.querySelector('#start') as HTMLElement).onclick = () => {
  console.log('start');
  player.play(song);
};
(document.querySelector('#stop') as HTMLElement).onclick = () => {
  player.stop();
};
const onScaleChange = () => {
  // editor.setPixelsPerSecondFactor(parseInt(scaleSlider.value, 10) / 100);
};
