import { SampleManager } from 'sample-manager';
import { ISequence, ISong } from '../../src/lib/interface';
import { createSampleSequence } from '../../src/lib/sequence';

const context = new AudioContext();
const manager = new SampleManager(context, 'samples/');
manager.addSamplesFromNames(['kick', 'clap']);


const data = {
  '0.0.0': ['kick', 1, 'clap', 1],
  '2.0.0': ['kick', 1, 'clap', 1],
};

const seq: ISequence = createSampleSequence('id', data);
const song: ISong = {
  sequences: [seq],
};

console.log(song);
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

