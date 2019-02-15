export function playBuffer(
  context: AudioContext,
  destination: AudioNode,
  buffer: AudioBuffer,
  time: number,
  from: number,
  duration = -1,
  volume = 1,
): IPlayBufferResult | null {
  if (time < context.currentTime) {
    // time is already in the past
    return null;
  }

  // create nodes
  const gainNode = context.createGain();
  const bufferSourceNode = context.createBufferSource();

  // init volume and sampledata
  gainNode.gain.value = volume;
  bufferSourceNode.buffer = buffer;

  // make connections
  bufferSourceNode.connect(gainNode);
  gainNode.connect(destination);

  // start
  bufferSourceNode.start(time, from, duration === -1 ? void 0 : duration);

  return {
    bufferSourceNode,
    gainNode,
  };
}

export interface IPlayBufferResult {
  bufferSourceNode: AudioBufferSourceNode;
  gainNode: GainNode;
}
