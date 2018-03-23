export default class Interval {
  private intervalId: number;
  private isRunning = false;
  private callback: () => void;
  private interval: number;

  constructor(callback: () => void, interval: number) {
    this.callback = callback;
    this.interval = interval;
  }

  public start(): void {
    if (this.isRunning) {
      console.error('Interval is already running');
      return;
    }
    this.isRunning = true;
    this.intervalId = window.setInterval(this.callback, this.interval * 1000);
  }

  public stop(): void {
    this.isRunning = false;
    clearInterval(this.intervalId);
  }

  public dispose() {
    this.stop();
  }
}
