import Song from '../../src/lib/Song';
import { createSampleSequence } from '../../src/lib/util/sequenceUtils';
import SequencePlayer, { SequencePlayerEvent } from '../../src/lib/SequencePlayer';
import {PlayMode} from "../../src/lib/data/enum";
import MusicTime from "musictime";
import SampleManager from "sample-manager";


const showPlayerState = state => {
  (<HTMLElement>document.querySelector('#state')).innerText = state;
};

const context = new AudioContext();


const player = new SequencePlayer(context, 'samples/', 'wav');
console.log(player);
player.sampleManager.addSamplesFromNames(['kick', 'clap']);

showPlayerState(player.getState());

player.addEventListener('state-change', (event:SequencePlayerEvent) => {
  showPlayerState(event.data);
});

const data = {
  '0.0.0': ['kick', 1, 'clap', 1],
  '2.0.0': ['kick', 1, 'clap', 1],
};


const song = new Song(120);
song.addSequenceAtTime(createSampleSequence('id', data), new MusicTime(0, 0, 0));
song.addSequenceAtTime(createSampleSequence('id', data), new MusicTime(4, 0, 0));
console.log(song);


document.querySelector('#start').addEventListener('click', () => {
  // player.loadSong(song).then(() => {
  //
  //   console.log('done');
  // });
  player.play(song, PlayMode.LIVE);
});

document.querySelector('#stop').addEventListener('click', () => {
  player.stop();
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
