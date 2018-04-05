import Editor from '../../src/lib/editor/Editor';
import SequencePlayer from '../../src/lib/SequencePlayer';
import Song from '../../src/lib/Song';
import { createSampleSequence } from '../../src/lib/util/sequenceUtils';
import MusicTime from 'musictime';
import { SequencePlayerEvent } from '../../src/lib/data/event';
import { SequencePlayerState } from '../../src/lib/data/enum';
import AnimationFrame from '../../src/lib/util/AnimationFrame';

declare const Vue;
const notPlayingTime = '--.--.--';

new Vue({
  el: '#app',
  mounted() {
    this.frame = new AnimationFrame(this.onFrame);
    this.context = new AudioContext();
    this.player = new SequencePlayer(this.context, 'samples/', 'wav');
    this.editor = new Editor(document.querySelector('#editor'), this.player);
    this.player.sampleManager.addSamplesFromNames(['kick', 'clap', 'synth', 'snare', 'hihat']);

    this.player.addEventListener('state-change', this.onPlayerStateChange);

    // create a song
    this.song = new Song(120);
    const seq1 = createSampleSequence('seq1', {
      '0.0.0': ['kick'],
      '0.1.0': ['snare'],
      '0.2.0': ['kick'],
      '0.2.2': ['snare'],
    });
    const seq2 = createSampleSequence('seq2', {
      '0.0.0': ['hihat'],
      '0.1.0': ['hihat'],
      '0.2.0': ['hihat'],
      '1.0.2': ['hihat'],
      '1.3.1': ['hihat'],
      '2.0.2': ['hihat'],
      '2.3.2': ['hihat'],
    });

    this.song.addSequenceAtTime(seq1, new MusicTime(0,0,0));
    this.song.addSequenceAtTime(seq1, new MusicTime(2,0,0));
    this.song.addSequenceAtTime(seq1, new MusicTime(3,0,0));
    this.song.addSequenceAtTime(seq2, new MusicTime(1,0,0));

    this.editor.setSong(this.song);
  },
  data: {
    musicTime: notPlayingTime,
  },
  methods: {
    onPlayerStateChange(event: SequencePlayerEvent) {
      switch(event.data) {
        case SequencePlayerState.IDLE: {
          this.musicTime = notPlayingTime;
          this.frame.stop();
          break;
        }
        case SequencePlayerState.PLAYING: {
          this.frame.start();
          break;
        }
      }
    },
    start() {
      this.player.play(this.song);
    },
    stop() {
      this.player.stop();
    },
    onScaleChange() {
      this.editor.setPixelsPerSecondFactor(parseInt(this.$refs.scaleSlider.value, 10) / 100);
    },
    onFrame() {
      this.musicTime = this.player.timeData.playMusicTime.toString();
    }
  },
});

/*
song2.addSection(MusicTime.fromString('2.0.0'), MusicTime.fromString('3.0.0'));

const testTime = 0;
editor.setSong(song2);
const startSection = getSectionOnTime(song2, testTime);
startSection.startedAt = testTime;

const items = getEventScheduleList(song2, testTime, 1.1, startSection);
console.log(items);
*/
