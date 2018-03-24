export function playBuffer(
  context: AudioContext,
  destination: AudioNode,
  buffer: AudioBuffer,
  time: number,
  from: number,
  duration = -1,
  volume = 1,
): { bufferSourceNode: AudioBufferSourceNode; gainNode: GainNode } {
  if (time < context.currentTime) {
    // time is already in the past
    return null;
  }
  console.log('play sample', time);
  const gainNode = context.createGain();
  const bufferSourceNode = context.createBufferSource();

  gainNode.gain.value = volume;
  bufferSourceNode.buffer = buffer;

  bufferSourceNode.connect(gainNode);
  gainNode.connect(destination);

  bufferSourceNode.start(time, from, duration === -1 ? void 0 : duration);

  return {
    bufferSourceNode,
    gainNode,
  };
}
