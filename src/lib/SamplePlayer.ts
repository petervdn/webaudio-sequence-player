import { IScheduleEventData } from './util/schedulerUtils';
import { IPlayBufferResult, playBuffer } from './util/webAudioUtils';
import { ISampleEvent } from './data/interface';

export default class SamplePlayer {
  private context: AudioContext;
  private output: AudioNode;
  private playingSamples: IPlayBufferResult[] = [];

  constructor(context: AudioContext, output: AudioNode) {
    this.context = context;
    this.output = output;
  }

  public playSample(data: IScheduleEventData, playStartTime: number): void {
    const event = <ISampleEvent>data.event;
    const playResult = playBuffer(
      this.context,
      this.output,
      event.sample.audioBuffer,
      data.absoluteSeconds + playStartTime, // start time
      0, // play from
      -1, // play to
      event.volume,
    );

    // add to list to keep track of playing samples
    this.playingSamples.push(playResult);

    // when playing is done, remove from list
    playResult.bufferSourceNode.onended = () => {
      const index = this.playingSamples.indexOf(playResult);

      if (index > -1) {
        this.playingSamples.splice(index, 1);
      }
    };
  }

  public stopAll(): void {
    this.playingSamples.forEach(item => {
      item.bufferSourceNode.stop(0);
      item.bufferSourceNode.disconnect();
      item.gainNode.disconnect();
    });

    this.playingSamples = [];
  }
}
