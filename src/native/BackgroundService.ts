import BackgroundService from "react-native-background-actions";
import EventEmitter from "./EventEmitter";
import HTTPServer from "./HttpServer";
import { days_between } from "../Methods";


const sleep = time =>
  new Promise(resolve =>
    setTimeout(resolve, time || 0)
  );

const veryIntensiveTask =
  async taskDataArguments => {
    // Example of an infinite loop task
    const { delay } = taskDataArguments;
    console.info("veryIntensiveTask", taskDataArguments)
    let tasks: EventEmitter<string>[] = [];
    let getDate = (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date;
    };

    tasks.push(new EventEmitter(.5, () => {
      const dm = context.downloadManager();
      const keys = [...dm.prepItems.keys()].filter(x => !dm.items.has(x) && dm.prepItems.get(x)?.protected !== true);
      for (let url of keys) {
        let item = dm.prepItems.get(url);
        dm.download(url, item.parserName, item.startFromIndex);
      }
    }));

    // TempImages
    tasks.push(
      new EventEmitter<string>(10, async function () {
        try {
          let dChecked = [...this.dataCheckedToday.entries()] as [string, Date][];
          this.extra = (
            !this.extra || this.extra.length <= 0
              ? (await context.imageTempCache.allFiles()).filter(Boolean)
              : this.extra
          ).filter(x => !dChecked.some(a => a[0] == x && days_between(a[1]) < 1));
          let i = 5;
          while (i > 0 && this.extra.length > 0) {
            i--;
            let f: string = this.extra.shift();
            let imageDate = new Date((await context.imageTempCache.read(f)).split("\n")[0]);
            if (days_between(imageDate) > 1) {
              this.dataCheckedToday.delete(f);
              await context.imageTempCache.delete(f);
            } else this.dataCheckedToday.set(f, getDate(1));
          }
        } catch (e) {
          console.error("Background Periodic cleanup failed:", e);
        }
      })
    );

    // file cleaner
    tasks.push(
      new EventEmitter<string>(10, async function () {
        try {
          let dChecked = [...this.dataCheckedToday.entries()] as [string, Date][];
          this.extra = (
            !this.extra || this.extra.length <= 0
              ? (await context.cache.allFiles()).filter(Boolean)
              : this.extra
          ).filter(x => !dChecked.some(a => a[0] == x && days_between(a[1]) < 2));
          let i = 5;
          while (i > 0 && this.extra.length > 0 && context.downloadManager().items.size <= 0) {
            i--;
            let f: string = this.extra.shift();
            let data = JSON.parse((await context.cache.read(f)) ?? "");
            if (days_between(data.date) >= 20) {
              this.dataCheckedToday.delete(f);
              await context.cache.delete(f);
              let book = await context.db.Books.query.where
                .column(x => x.url).equalTo(data.data.url)
                .firstOrDefault();
              if (book && !book.favorit)
                await context.db.deleteBook(book.id);

            } else this.dataCheckedToday.set(f, getDate(2));
          }
        } catch (e) {
          console.error("Background Periodic cleanup failed:", e);
        }
      })
    );

    while (BackgroundService.isRunning()) {
      for (const t of tasks) t.check();
      await sleep(delay);
    }
  };

const options = {
  taskName: "Novelo",
  taskTitle: "File and download handler",
  taskDesc:
    "This task handle files and novel downloads",
  taskIcon: {
    name: "ic_launcher",
    type: "mipmap"
  },
  color: "#ff00ff",
  linkingURI: "novels://file", // See Deep Linking for more info
  progressBar: undefined,
  parameters: {
    delay: 3000
  },
  foregroundServiceType: ["dataSync"] as any
};

export class BgService {
  async start() {
    try {
      await BackgroundService.start(
        veryIntensiveTask,
        options
      );


    } catch (e) { console.error(e) }
  }

  async updateProgressBar(taskDesc: string, progress?: number) {
    // Normalize to always between 0 and 1

    // If no progress provided, remove it
    if (progress == undefined || progress == null || isNaN(progress)) {
      return BackgroundService.updateNotification({
        taskDesc: options.taskDesc,
        progressBar: undefined,
      });
    }
    return BackgroundService.updateNotification({
      taskDesc,
      progressBar: {
        value: progress,
        max: 100,
        indeterminate: progress <= 0 || progress >= 100,  // <-- Your choice
      },
    });
  }


  async notify() {
    await BackgroundService.updateNotification({
      taskDesc: "New ExampleTask description"
    });
  }

  async stop() {
    try {
      await BackgroundService.stop();

    } catch (e) { }
  }
}

const bgService = new BgService();
export default bgService;
