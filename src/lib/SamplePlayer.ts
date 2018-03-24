import { IScheduleEventData } from './util/schedulerUtils';
import { playBuffer } from './util/webAudioUtils';
import { ISampleEvent } from './data/interface';

export default class SamplePlayer {
  private context: AudioContext;
  private output: AudioNode;

  constructor(context: AudioContext, output: AudioNode) {
    this.context = context;
    this.output = output;
  }

  public playSample(data: IScheduleEventData, playStartTime: number): void {
    const event = <ISampleEvent>data.event;
    playBuffer(
      this.context,
      this.output,
      event.sample.audioBuffer,
      data.absoluteSeconds + playStartTime,
      0,
    );
  }
}
