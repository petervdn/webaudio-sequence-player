export default class Interval {
  private intervalId: number;
  private isRunning = false;

  constructor(private callback: () => void, private interval: number) {}

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
}
