export default class EventEmitter<T> {
  minutes: number;
  func: Function;
  running = false;
  nextRun: number; // timestamp in ms
  extra?: T[];

  constructor(minutes: number, func: Function) {
    this.func = func;
    this.minutes = minutes;
    this.updateNextRun();
  }

  updateNextRun() {
    this.nextRun = Date.now() + this.minutes * 60000;
  }

  async run() {
    try {
      await this.func.call(this);
    } catch (e) {
      console.error("EventEmitter error:", e);
    } finally {
      this.running = false;
      this.updateNextRun();
    }
  }

  check() {
    if (this.running) return;
    if (Date.now() >= this.nextRun) {
      this.running = true;
      this.run();
    }
  }
}
