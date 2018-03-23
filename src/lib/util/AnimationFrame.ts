export default class AnimationFrame {
  private callback: () => void;
  private stopped = false;
  // private requestAnimationFrameId: number;

  constructor(callback: () => void) {
    this.callback = callback;
  }

  public start() {
    this.stopped = false;
    this.update();
  }

  public stop() {
    // cancelAnimationFrame(this.requestAnimationFrameId);
    this.stopped = true;
  }

  update = () => {
    this.callback();

    if (!this.stopped) {
      requestAnimationFrame(this.update);
    }
  };
}
