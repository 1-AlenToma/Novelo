export default class EventEmitter {
  minutes: number;
  func: Function;
  running: boolean = false;
  lastRun: Date;
  extra?: undefined;
  constructor(minutes: number, func: Function) {
    this.func = func;
    this.minutes = minutes;
    this.hasRun();
  }

  hasRun() {
    this.lastRun = new Date(
      new Date().getTime() + this.minutes * 60000
    );
  }

  async run() {
    try {
      await this.func.bind(this)();
    } catch (e) {
      console.error(e);
    } finally {
      this.hasRun();
      this.running = false;
    }
  }

  check() {
    if (this.running) return;
    if (this.lastRun >= new Date()) {
      this.running = true;
      this.run();
    }
  }
}
