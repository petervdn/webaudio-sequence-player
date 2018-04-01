import Song from '../../src/lib/Song';
import { createSampleSequence } from '../../src/lib/util/sequenceUtils';
import SequencePlayer from '../../src/lib/SequencePlayer';
import MusicTime from 'musictime';
import { SequencePlayerEvent } from '../../src/lib/data/event';
import AnimationFrame from '../../src/lib/util/AnimationFrame';
import Editor from '../../src/lib/editor/Editor';
import { getEventScheduleList } from '../../src/lib/util/scheduleUtils';

const stateElement = <HTMLElement>document.querySelector('#state');
const timeElement = <HTMLElement>document.querySelector('#time');

const showPlayerState = state => {
  stateElement.innerText = state;
};

const context = new AudioContext();
const player = new SequencePlayer(context, 'samples/', 'wav');
player.sampleManager.addSamplesFromNames(['kick', 'clap', 'synth', 'snare', 'hihat']);

showPlayerState(player.getState());

player.addEventListener('state-change', (event: SequencePlayerEvent) => {
  showPlayerState(event.data);
});

document.querySelector('#start').addEventListener('click', () => {
  player.play(song2);
});

document.querySelector('#stop').addEventListener('click', () => {
  player.stop();
});

const slider = <HTMLInputElement>document.querySelector('#scale');
slider.addEventListener('input', () => {
  editor.setPixelsPerSecondFactor(parseInt(slider.value, 10) / 100);
});

const animationFrame = new AnimationFrame(() => {
  const musicTime = player.timeData.playMusicTime;
  timeElement.innerText = `${musicTime.bars}.${musicTime.beats}.${musicTime.sixteenths}`;
});
animationFrame.start();

const data1 = {
  '0.0.0': ['kick', 1, 'synth', 1],
  '0.1.0': ['kick', 1, 'clap', 1],
  '0.2.0': ['kick', 1],
  '0.3.0': ['kick', 1, 'clap', 1],
  '1.0.0': ['kick', 1],
  '1.1.0': ['kick', 1, 'clap', 1],
  '1.2.0': ['kick', 1],
  '1.3.0': ['kick', 1, 'clap', 1],
  '2.0.0': ['kick', 1],
  '2.1.0': ['clap', 1],
  '2.2.0': [],
  '2.3.0': ['clap', 1],
  '3.0.0': ['kick', 1],
  '3.1.0': ['clap', 1],
  '3.2.0': [],
  '3.3.0': ['clap', 1],
};
const data2 = {
  '0.2.2': ['snare'],
  '1.3.0': ['snare'],
  '2.2.2': ['snare'],
  '3.0.0': ['snare', 1 / 8],
  '3.0.2': ['snare', 2 / 8],
  '3.1.0': ['snare', 3 / 8],
  '3.1.2': ['snare', 4 / 8],
  '3.2.0': ['snare', 5 / 8],
  '3.2.2': ['snare', 6 / 8],
  '3.3.0': ['snare', 7 / 8],
  '3.3.2': ['snare', 8 / 8],
};

const data3 = {
  '0.0.0': ['hihat'],
  '0.0.1': ['hihat'],
  '0.0.2': ['hihat'],
  '0.0.3': ['hihat'],
};

const song = new Song(128);
const seq1 = createSampleSequence('seq1', data1);
const seq2 = createSampleSequence('snare', data2);
const seq3 = createSampleSequence('hihat', data3);
// song.addSequenceAtTime(seq1, new MusicTime(0, 0, 0));
// song.addSequenceAtTime(seq1, new MusicTime(4, 0, 0));
// song.addSequenceAtTime(seq1, new MusicTime(8, 0, 0));
// song.addSequenceAtTime(seq2, new MusicTime(0, 0, 0));
// song.addSequenceAtTime(seq2, new MusicTime(4, 0, 0));
// song.addSequenceAtTime(seq3, new MusicTime(4, 0, 0));
// song.addSequenceAtTime(seq3, new MusicTime(5, 0, 0));
// song.addSequenceAtTime(seq3, new MusicTime(6, 0, 0));
// song.addSequenceAtTime(seq3, new MusicTime(7, 0, 0));


const data4 = {
  '0.0.0': ['kick'],
  '0.1.0': ['hihat'],
  '0.2.0': ['kick'],
  '0.2.2': ['hihat'],
};
const song2 = new Song(120);
const seq = createSampleSequence('seq1', data4);
song2.addSequenceAtTime(seq, new MusicTime(0,0,0));
song2.addSequenceAtTime(seq, new MusicTime(2,0,0));
song2.addSequenceAtTime(seq, new MusicTime(3,0,0));

const editor = new Editor(document.querySelector('#editor'), player);
 song.addSection(MusicTime.fromString('4.0.0'), MusicTime.fromString('8.0.0'));
editor.setSong(song2);

const items = player.scheduleAtTime(song, 7.5, 1, true);
console.log(items);

