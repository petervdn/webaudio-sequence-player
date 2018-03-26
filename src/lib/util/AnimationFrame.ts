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
    if (!this.stopped) {
      this.callback();
      requestAnimationFrame(this.update);
    }
  };
}
