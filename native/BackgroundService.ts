import BackgroundService from "react-native-background-actions";

const sleep = time =>
  new Promise(resolve =>
    setTimeout(() => resolve(), time)
  );

// You can do anything in your task such as network requests, timers and so on,
// as long as it doesn't touch UI. Once your task completes (i.e. the promise is resolved),
// React Native will go into "paused" mode (unless there are other tasks running,
// or there is a foreground app).
const veryIntensiveTask =
  async taskDataArguments => {
    // Example of an infinite loop task
    const { delay } = taskDataArguments;
    await new Promise(async resolve => {
      for (
        let i = 0;
        BackgroundService.isRunning();
        i++
      ) {
        console.log(i);
        await sleep(delay);
      }
    });
  };

const options = {
  taskName: "Novelo",
  taskTitle: "File handler",
  taskDesc:
    "This task handle files and novel downloads",
  taskIcon: {
    name: "ic_launcher",
    type: "mipmap"
  },
  color: "#ff00ff",
  linkingURI: "novelo://novel", // See Deep Linking for more info
  parameters: {
    delay: 1000
  }
};

export default class BGService {
  static async start() {
    await BackgroundService.start(
      veryIntensiveTask,
      options
    );
  }

  static async notify() {
    await BackgroundService.updateNotification({
      taskDesc: "New ExampleTask description"
    });
  }

  static async stop() {
    await BackgroundService.stop();
  }
}
