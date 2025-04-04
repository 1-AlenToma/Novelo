import BackgroundService from "react-native-background-actions";
import EventEmitter from "./EventEmitter";

const sleep = time =>
  new Promise(resolve =>
    setTimeout(resolve, time || 0)
  );

const veryIntensiveTask =
  async taskDataArguments => {
    // Example of an infinite loop task
    const { delay } = taskDataArguments;
    console.info(taskDataArguments)
    let tasks: any = [];
    let getDate = (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date;
    };
    tasks.push(
      new EventEmitter(10, async function () {
        this.extra = (
          !this.extra || this.extra.length <= 0
            ? await context.cache.allFiles()
            : this.extra).filter(x => x);
        let i = 5;
        while (i > 0 && this.extra.length > 0 && context.downloadManager().items.size <= 0) {
          i--;
          let f = this.extra.shift();
          let date = getDate(30);
          let data = JSON.parse((await context.cache.read(f)) ?? "");
          if (data.date > date) {
            await context.cache.delete(f);
            let book = await context.db.Books.query.where
              .column(x => x.url).equalTo(data.data.url)
              .firstOrDefault();
            if (book && !book.favorit)
              await context.db.deleteBook(book.id);
          }
        }
      })
    );
    await new Promise(async resolve => {
      for (
        let i = 0;
        BackgroundService.isRunning();
        i++
      ) {
        tasks.forEach(x => x.check());
        await sleep(delay);
      }
    });
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
  parameters: {
    delay: 3000
  }
};

export default class BGService {
  static async start() {
    try {
      await BackgroundService.start(
        veryIntensiveTask,
        options
      );
    } catch (e) { console.error(e) }
  }

  static async notify() {
    await BackgroundService.updateNotification({
      taskDesc: "New ExampleTask description"
    });
  }

  static async stop() {
    try {
      await BackgroundService.stop();
    } catch (e) { }
  }
}
