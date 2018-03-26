import AbstractEvent from 'seng-event/lib/AbstractEvent';

export class SequencePlayerEvent extends AbstractEvent {
  public data: any;

  constructor(
    type: string,
    data?: any,
    bubbles: boolean = false,
    cancelable: boolean = false,
    setTimeStamp: boolean = false,
  ) {
    super(type, bubbles, cancelable, setTimeStamp);
    this.data = data;
  }

  public clone(): SequencePlayerEvent {
    return new SequencePlayerEvent(
      this.type,
      this.data,
      this.bubbles,
      this.cancelable,
      this.timeStamp !== 0,
    );
  }
}
