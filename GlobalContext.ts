//import GlobalState from "react-global-state-management";
import dbContext from "./db/dbContext";
import * as Speech from "expo-speech";
import { AppSettings } from "./db";
import { newId } from "./Methods";
import { GlobalState } from "./GlobalState";
import {
  Player,
  BGService,
  FileHandler,
  HttpHandler,
  DownloadManager,
  ImageCache
} from "./native";
import {
  Dimensions,
  Keyboard,
  LogBox
} from "react-native";

LogBox.ignoreLogs([
  "fontFamily",
  "require cycles",
  "Require cycle",
  "new NativeEventEmitter",
  "Internal React error",
  "xmldom warning"
]);

import * as ScreenOrientation from "expo-screen-orientation";
import ParserWrapper from "./parsers/ParserWrapper";
const globalDb = new dbContext();
const globalHttp = new HttpHandler();
type ThemeMode = "light" | "dark";
const parsers = ParserWrapper.getAllParsers();
let currentParser = parsers[0];
const downloadManager = new DownloadManager(
  () => data
);
const cache = new FileHandler("Memo", "Cache");
const imageCache = new ImageCache();
const files = new FileHandler(
  "noveloFiles",
  "File"
);

const data = GlobalState(
  {
    selectedFoldItem: "",
    panEnabled: true,
    selection: {
      downloadSelectedItem: undefined,
      favoritItem: undefined
    },
    alertMessage: {
      msg: undefined,
      title: "Action",
      confirm: (answer: boolean) => {}
    },
    novelFavoritInfo: {},
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
        },
        toast: () => {
          data.alertMessage.msg = msg;
          data.alertMessage.title = title;
          data.alertMessage.confirm = undefined;
          data.alertMessage.toast = true;
        }
      };
    },
    player: {} as Player,
    http: () => globalHttp,
    downloadManager: () => downloadManager,
    KeyboardState: false,
    isFullScreen: false,
    appSettings: AppSettings.n(),
    voices: undefined,
    cache: () => cache,
    files: () => files,
    imageCache: () => imageCache,
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
      set: (p: any) => {
        currentParser = p;
        data.updater = newId();
      },
      all: () => parsers
    },
    updater: newId(),
    theme: {
      settings: undefined,
      invertSettings: () => {},
      themeMode: "dark" as ThemeMode,
      getRootTheme: (themeMode?: ThemeMode) => {},
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
    dbContext: () => globalDb,
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
        let appSettingWatcher =
          globalDb.database.watch("AppSettings");
        appSettingWatcher.onSave =
          async items => {
            let item = items?.firstOrDefault();
            if (item) data.appSettings = item;
          };
        data.theme.themeMode =
          data.appSettings.theme;
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

        await BGService.start();
        return [
          hideSubscription,
          showSubscription,
          windowEvent,
          { remove: () => BGService.stop() },
          {
            remove: () =>
              appSettingWatcher.removeWatch()
          }
        ];
      } catch (e) {
        console.error(e);
      }
    }
  },
  "nav",
  "voices",
  "selection.downloadSelectedItem",
  "selection.favoritItem",
  "player.currentChapterSettings.scrollProgress",
  "player.book.chapterSettings",
  "player.novel"
);
export default data;
