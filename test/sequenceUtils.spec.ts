import { expect } from 'chai';
import { createSampleSequence } from '../src/lib/util/sequenceUtils';
import {SequenceEventType} from "../src/lib/data/enum";

describe('sequenceUtils', () => {
  it('should create a sampleSequence', () => {
    const data = {
      '0.0.0': ['kick', 1, 'synth', 1],
      '0.1.0': ['clap', 0.5],
    };

    const seq = createSampleSequence('seq1', data);

    // store music times and remove from object (so we can do a deep equal)
    const startTimes = seq.events.map(e => e.relativeStart);
    seq.events.forEach(event => {
      delete event.relativeStart;
    });
    expect(startTimes.map(time => time.toString())).to.deep.equal(
      ['0.0.0', '0.0.0', '0.1.0'],
    );

    // compare renaining object
    expect(seq).to.deep.equal({
      id: 'seq1',
      target: null,
      events: [
        {
          sampleName: 'kick',
          volume: 1,
          sample: null,
          type: SequenceEventType.SAMPLE,
          lastScheduledData: {},
        },
        {
          sampleName: 'synth',
          volume: 1,
          sample: null,
          type: SequenceEventType.SAMPLE,
          lastScheduledData: {},
        },
        {
          sampleName: 'clap',
          volume: 0.5,
          sample: null,
          type: SequenceEventType.SAMPLE,
          lastScheduledData: {},
        },
      ],
    });
  });
});
