import Song from '../../src/lib/Song';
import { createSampleSequence } from '../../src/lib/sequenceUtils';
import SequencePlayer from '../../src/lib/SequencePlayer';
import {PlayMode} from "../../src/lib/enum";
import MusicTime from "musictime";
import SampleManager from "sample-manager";

const context = new AudioContext();
const manager = new SampleManager(context, 'samples/');
manager.addSamplesFromNames(['kick', 'clap']);

const player = new SequencePlayer(context);
player.sampleManager.basePath = 'samples/';
player.sampleManager.addSamplesFromNames(['kick', 'clap']);

const data = {
  '0.0.0': ['kick', 1, 'clap', 1],
  '2.0.0': ['kick', 1, 'clap', 1],
};


const song = new Song();
song.addSequenceAtTime(createSampleSequence('id', data), new MusicTime(0, 0, 0));
song.addSequenceAtTime(createSampleSequence('id', data), new MusicTime(4, 0, 0));
console.log(song);


document.querySelector('#start').addEventListener('click', () => {
  player.loadSong(song, 'wav').then(() => {
    // player.play(song, 120, PlayMode.LIVE);
    console.log('done');
  });
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
