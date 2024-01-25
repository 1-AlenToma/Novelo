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
      //await globalDb.database.dropTables();
      await globalDb.database.setUpDataBase();
      data.appSettings = await globalDb.database
        .querySelector<AppSettings>("AppSettings")
        .findOrSave(data.appSettings);
      data.voices =
        await Speech.getAvailableVoicesAsync();
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
    }
  },
  undefined,
  false
);
export default data;
