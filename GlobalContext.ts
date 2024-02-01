import GlobalState from "react-global-state-management";
import dbContext from "./db/dbContext";
import * as Speech from "expo-speech";
import { AppSettings } from "./db";
import {
  Player,
  BGService,
  FileHandler,
  HttpHandler
} from "./native";
import {
  Dimensions,
  Keyboard,
  LogBox
} from "react-native";
LogBox.ignoreLogs([
  "require cycles",
  "Require cycle",
  "new NativeEventEmitter",
  "Internal React error"
]);
import * as ScreenOrientation from "expo-screen-orientation";
import ParserWrapper from "./parsers/ParserWrapper";
const globalDb = new dbContext();
const globalHttp = new HttpHandler();
type ThemeMode = "light" | "dark";
const parsers = ParserWrapper.getAllParsers();
let currentParser = parsers[0];
const data = GlobalState(
  {
    selection: {
      downloadSelectedItem: undefined
    },
    alertMessage: {
      msg: undefined,
      title: "Action",
      confirm: (answer: boolean) => {}
    },
    alert: (msg: string, title?: string) => {
      return {
        show: () => {
          data.alertMessage.msg = msg;
          data.alertMessage.title = title;
          data.alertMessage.confirm = undefined;
        },
        confirm: (func: Function) => {
          data.alertMessage.msg = msg;
          data.alertMessage.title = title;
          data.alertMessage.confirm = func;
        }
      };
    },
    player: {} as Player,
    http: () => globalHttp,
    KeyboardState: false,
    isFullScreen: false,
    appSettings: AppSettings.n(),
    voices: undefined,
    cache: new FileHandler("tempFiles", "Cache"),
    files: new FileHandler("noveloFiles", "File"),
    speech: Speech,
    nav: undefined,
    orientation: (
      value: "Default" | "LANDSCAPE"
    ) => {
      ScreenOrientation.lockAsync(
        value === "Default"
          ? ScreenOrientation.OrientationLock
              .DEFAULT
          : ScreenOrientation.OrientationLock
              .LANDSCAPE
      );
    },
    parser: {
      current: () => currentParser,
      find: (name: string) =>
        parsers.find(x => x.name == name),
      all: () => parsers
    },
    theme: {
      settings: {},
      invertSettings: () => {},
      themeMode: "light" as ThemeMode,
      textTheme: () => {
        return { color: data.theme.color };
      },
      viewTheme: () => {
        return {
          backgroudColor:
            data.theme.backgroundColor
        };
      }
    },
    db: () => globalDb.database,
    size: {
      window: Dimensions.get("window"),
      screen: Dimensions.get("screen")
    },
    init: async () => {
      try {
        //await globalDb.database.dropTables();

        const loadVoices = (counter?: number) => {
          setTimeout(
            async () => {
              var voices =
                await Speech.getAvailableVoicesAsync();

              if (voices.length > 0)
                data.voices = voices;
              else {
                console.log("voices not found");
                if (!counter || counter < 10)
                  loadVoices((counter ?? 0) + 1);
              }
            },
            (counter ?? 1) * 300
          );
        };
        await globalDb.database.setUpDataBase();
        await globalDb.database.migrateNewChanges();
        data.appSettings = await globalDb.database
          .querySelector<AppSettings>(
            "AppSettings"
          )
          .findOrSave(data.appSettings);
        loadVoices();
        data.parser.current().settings =
          await data.parser.current().load();
        const showSubscription =
          Keyboard.addListener(
            "keyboardDidShow",
            () => {
              data.KeyboardState = true;
            }
          );
        const hideSubscription =
          Keyboard.addListener(
            "keyboardDidHide",
            () => {
              data.KeyboardState = false;
            }
          );

        let windowEvent =
          Dimensions.addEventListener(
            "change",
            e => {
              data.size = { ...e };
            }
          );
        //await BGService.start();
        return [
          hideSubscription,
          showSubscription,
          windowEvent
          // {remove:()=> BGService.stop()}
        ];
      } catch (e) {
        console.error(e);
      }
    }
  },
  ["nav", "events"],
  false
);
export default data;
