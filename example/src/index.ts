import { SampleManager } from 'sample-manager';
import { ISequence } from '../../src/lib/interface';
import Song from '../../src/lib/Song';
import MusicTime from 'musictime/lib/MusicTime';
import { createSampleSequence } from '../../src/lib/sequenceUtils';
import SequencePlayer from '../../src/lib/SequencePlayer';
import {PlayMode} from "../../src/lib/enum";

const context = new AudioContext();
const manager = new SampleManager(context, 'samples/');
manager.addSamplesFromNames(['kick', 'clap']);

const player = new SequencePlayer(context);

const data = {
  '0.0.0': ['kick', 1, 'clap', 1],
  '2.0.0': ['kick', 1, 'clap', 1],
};


const song = new Song();
song.addSequenceAtTime(createSampleSequence('id', data), new MusicTime(0, 0, 0));
song.addSequenceAtTime(createSampleSequence('id', data), new MusicTime(4, 0, 0));
console.log(song);
document.querySelector('#start').addEventListener('click', () => {
  player.play(song, 120, PlayMode.LIVE);
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
