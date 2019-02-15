import { AbstractEvent } from 'seng-event';
import { generateEventTypes, EVENT_TYPE_PLACEHOLDER } from 'seng-event/lib/util/eventTypeUtils';

export class SongPlayerEvent extends AbstractEvent {
  public static STATE_CHANGE: string = EVENT_TYPE_PLACEHOLDER;

  public clone(): SongPlayerEvent {
    return new SongPlayerEvent(this.type, this.bubbles, this.cancelable);
  }
}
generateEventTypes({ SongPlayerEvent });
