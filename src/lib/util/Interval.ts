export default class Interval {
  private readonly callback: () => void;
  private readonly intervalSeconds: number;
  private intervalId: number | undefined;
  private isRunning = false;

  constructor(callback: () => void, intervalSeconds: number) {
    this.callback = callback;
    this.intervalSeconds = intervalSeconds;
  }

  public start(): void {
    if (this.isRunning) {
      throw new Error('Interval is already running');
    }
    this.isRunning = true;
    this.intervalId = window.setInterval(this.callback, this.intervalSeconds * 1000);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
    }
  }

  public dispose() {
    this.stop();
  }
}
