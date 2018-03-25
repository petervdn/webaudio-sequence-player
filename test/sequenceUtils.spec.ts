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
    const start0 = seq.events[0].relativeStart;
    const start1 = seq.events[1].relativeStart;
    const start2 = seq.events[2].relativeStart;
    seq.events.forEach(event => {
      delete event.relativeStart;
    });
    expect(start0.toString()).to.equal('0.0.0');
    expect(start1.toString()).to.equal('0.0.0');
    expect(start2.toString()).to.equal('0.1.0');
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
