import Song from '../../src/lib/Song';
import { createSampleSequence } from '../../src/lib/util/sequenceUtils';
import SequencePlayer, { SequencePlayerEvent } from '../../src/lib/SequencePlayer';
import MusicTime from 'musictime';
import { logSong } from '../../src/lib/util/songUtils';

const showPlayerState = state => {
  (<HTMLElement>document.querySelector('#state')).innerText = state;
};

const context = new AudioContext();

const player = new SequencePlayer(context, 'samples/', 'wav');
player.sampleManager.addSamplesFromNames(['kick', 'clap', 'synth']);

showPlayerState(player.getState());

player.addEventListener('state-change', (event: SequencePlayerEvent) => {
  showPlayerState(event.data);
});

const data = {
  // '0.0.0': ['kick', 1, 'clap', 1],
  // '0.1.0': ['kick', 1, 'clap', 1],
  // '0.2.0': ['kick', 1, 'clap', 1],
  // '0.3.0': ['kick', 1, 'clap', 1],
  // '2.0.0': ['kick', 1, 'clap', 1],
  // '2.1.0': ['kick', 1, 'clap', 1],
  // '2.2.0': ['kick', 1, 'clap', 1],
  // '2.3.0': ['kick', 1, 'clap', 1],
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

const song = new Song(128);
const seq = createSampleSequence('seq1', data);
song.addSequenceAtTime(seq, new MusicTime(0, 0, 0));
song.addSequenceAtTime(seq, new MusicTime(4, 0, 0));
logSong(song);
console.log(seq);
document.querySelector('#start').addEventListener('click', () => {
  // player.loadSong(song).then(() => {
  //
  //   console.log('done');
  // });
  player.play(song);
});

document.querySelector('#stop').addEventListener('click', () => {
  player.stop();
  console.log(MusicTime.TO_TIME_CACHE);
});
/*
import { loadAudioBuffer, loadSamples, createSamples, createSample } from 'webaudio-sample-loader';
import { ISequence } from "../../src/lib/sequence";

const context = new AudioContext();
const samples = createSamples(['kick', 'clap', 'orbit']);

samples[1].path = 'other-path/';
samples[2].extension = 'mp3';

loadSamples(context, samples, 'wav', 'samples/', (value) => {
  console.log('progress', value);
}).then(result => {
  console.log(result);
});
*/
