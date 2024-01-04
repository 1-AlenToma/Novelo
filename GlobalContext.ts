import GlobalState from "react-global-state-management";
import dbContext from "./db/dbContext";
import {
  Dimensions,
  Keyboard
} from "react-native";
import ParserWrapper from "./parsers/ParserWrapper";
const globalDb = new dbContext();
type ThemeMode = "light" | "dark";
const parsers = ParserWrapper.getAllParsers();
let currentParser = parsers[0];
const data = GlobalState(
  {
    KeyboardState: false,
    isFullScreen: false,
    fullscreen: isVisible => {},
    parser: {
      current: () => currentParser,
      find: (name: string) =>
        parsers.find(x => x.name == name),
      all: () => parsers
    },
    theme: {
      settings: {},
      invertSettings: () => {
        
      },
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
