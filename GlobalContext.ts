import GlobalState from "react-global-state-management";
import dbContext from "./db/dbContext";
import * as Speech from "expo-speech";
import { AppSettings } from "./db";
import { Player } from "./native";
import {
  Dimensions,
  Keyboard,
  LogBox
} from "react-native";
LogBox.ignoreLogs([
  "require cycles",
  "Require cycle",
  "new NativeEventEmitter"
]);
import * as ScreenOrientation from "expo-screen-orientation";
import ParserWrapper from "./parsers/ParserWrapper";
const globalDb = new dbContext();
type ThemeMode = "light" | "dark";
const parsers = ParserWrapper.getAllParsers();
let currentParser = parsers[0];
const data = GlobalState(
  {
    player: {} as Player,
    KeyboardState: false,
    isFullScreen: false,
    appSettings: AppSettings.n(),
    voices: undefined,
    speech: Speech,
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

        return [
          hideSubscription,
          showSubscription,
          windowEvent
        ];
      } catch (e) {
        console.error(e);
      }
    }
  },
  undefined,
  false
);
export default data;
