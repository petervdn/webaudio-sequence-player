import Editor from '../../src/lib/editor/Editor';
import {
  SequencePlayer,
  Song,
  MusicTime,
  SequencePlayerEvent,
  SequencePlayerState,
  getSectionOnTime,
  createSampleSequence,
} from '../../src';

// import { SequencePlayerEvent } from '../../src';
// import { SequencePlayerState } from '../../src';
import AnimationFrame from '../../src/lib/util/AnimationFrame';
// import { getEventScheduleList, getEventsInSection } from '../../src/lib/util/scheduleUtils';
// import { getSectionOnTime } from '../../src';
// import { ISampleEvent } from '../../src/lib/data/interface';

const notPlayingTime = '--.--.--';
const frame = new AnimationFrame(() => {
  musicTime = player.timeData.playMusicTime.toString();
});
const context = new AudioContext();
const player = new SequencePlayer(context, 'samples/', 'wav');
const editor = new Editor(document.querySelector('#editor') as HTMLElement, player);
player.sampleManager.addSamplesFromNames(['kick', 'clap', 'synth', 'snare', 'hihat']);

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
  '0.1.0': ['snare'],
  '0.0.0': ['kick'],
});

song.addSequenceAtTime(seq1, new MusicTime(0, 0, 0));
song.addSequenceAtTime(seq1, new MusicTime(0, 2, 0));

song.addSection(MusicTime.fromString('0.0.0'), MusicTime.fromString('1.0.0'));

editor.setSong(song); // todo this shouldnt have to be set on the player

editor.setPixelsPerSecondFactor(0.5);
let musicTime: string = notPlayingTime;

const start = () => {
  console.log('start');
  player.play(song);
};
const stop = () => {
  player.stop();
};
const onScaleChange = () => {
  // editor.setPixelsPerSecondFactor(parseInt(scaleSlider.value, 10) / 100);
};
