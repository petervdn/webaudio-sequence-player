import {expect} from 'chai';
import 'web-audio-test-api';
import SequencePlayer from '../src/lib/SequencePlayer';
import SampleManager from 'sample-manager';
import SamplePlayer from '../src/lib/SamplePlayer';

describe('SequencePlayer', () => {
  let player;
  const context = new AudioContext();

  beforeEach(() => {
    player = new SequencePlayer(context);
  });

  it('should construct', () => {

    expect(player instanceof SequencePlayer).to.equal(true);
    expect(player.samplePlayer instanceof SamplePlayer).to.equal(true);
    expect(player.sampleManager instanceof SampleManager).to.equal(true);
  });
});
