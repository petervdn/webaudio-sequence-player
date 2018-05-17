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
      '0.1.0': ['snare'],
      '0.0.0': ['kick'],
    });
    const seq2 = createSampleSequence('seq2', {
      '0.0.0': ['hihat'],
      '0.1.0': ['hihat'],
      '0.2.0': ['hihat'],
      '0.3.0': ['hihat'],
    });

    // this.song.addSequenceAtTime(seq2, new MusicTime(0,1,1));
    this.song.addSequenceAtTime(seq1, new MusicTime(0, 0, 0));
    this.song.addSequenceAtTime(seq1, new MusicTime(0, 2, 0));
    //  this.song.addSequenceAtTime(seq1, new MusicTime(3,0,0));
    // const section1 = this.song.addSection(MusicTime.fromString('0.1.0'), MusicTime.fromString('0.2.1'));
    // const section2 = this.song.addSection(MusicTime.fromString('0.2.0'), MusicTime.fromString('1.2.0'));
    // this.song.addSection(MusicTime.fromString('0.1.0'), MusicTime.fromString('1.2.0'));
    // this.song.addSection(MusicTime.fromString('0.0.2'), MusicTime.fromString('0.1.2'), 1);
    // this.song.addSection(MusicTime.fromString('0.1.0'), MusicTime.fromString('0.2.0'));
    this.song.addSection(MusicTime.fromString('0.0.0'), MusicTime.fromString('1.0.0'));

    this.editor.setSong(this.song);
    // const events = getEventsInSection(this.song, section2);
    // console.log(events.map(item => (<ISampleEvent>item.event).sampleName));

    const testTime = 0;
    const startSection = getSectionOnTime(this.song, 0);
    startSection.startedAt = 0; // startSection.start.toTime(this.song.bpm);
    // const items = getEventScheduleList(this.song, testTime, testTime + 2, startSection);
    // getEventScheduleList(this.song, testTime, testTime + 2, startSection);
    // getEventScheduleList(this.song, 2, 4, startSection);
    // getEventScheduleList(this.song, testTime, testTime + 1, startSection);
    // getEventScheduleList(this.song, 0, 1, startSection);
    // getEventScheduleList(this.song, 1, 2, startSection);
    // console.log(items);
    this.editor.setPixelsPerSecondFactor(0.5);
  },
  data: {
    musicTime: notPlayingTime,
  },
  methods: {
    onPlayerStateChange(event: SequencePlayerEvent) {
      switch (event.data) {
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
      console.log('start');
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
    },
  },
});
