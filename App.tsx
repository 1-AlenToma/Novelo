import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  useColorScheme,
  Dimensions,
  TouchableOpacity,
  LogBox
} from "react-native";
import "./Global.d";
import ParserTester from "./components/ParserTester";
import Parser from "./parsers/ReadNovelFull";
import useLoader from "./components/Loader";
import GlobalData from "./GlobalContext";
import { Menu } from "./pages";
import {AppMenu} from "./pages";
import * as NavigationBar from "expo-navigation-bar";
LogBox.ignoreLogs([
  /getprop/gim,
  /require cycle/gim
]);
export default function App() {
  GlobalData.hook("size", "theme.settings");
  const visibility =
    NavigationBar.useVisibility();
  const loader = useLoader(true);

  const setThemeStyle = () => {
    const colorScheme =
      GlobalData.theme.themeMode;
    const themeTextStyle =
      colorScheme === "light"
        ? styles.lightThemeText
        : styles.darkThemeText;
    const themeContainerStyle =
      colorScheme === "light"
        ? styles.lightContainer
        : styles.darkContainer;
    GlobalData.theme.invertSettings = () => {
      return GlobalData.theme.themeMode == "light"
        ? {
            ...styles.darkContainer,
            ...styles.darkThemeText
          }
        : {
            ...styles.lightContainer,
            ...styles.lightThemeText
          };
    };
    GlobalData.theme.settings = {
      ...themeTextStyle,
      ...themeContainerStyle
    };
  };
  GlobalData.subscribe(
    setThemeStyle,
    "theme.themeMode"
  );
  useEffect(() => {
    GlobalData.fullscreen = v => {
      GlobalData.isFullScreen = v;
      NavigationBar.setVisibilityAsync(
        !v ? "hidden" : "visible"
      );
      if (!v)
        NavigationBar.setBehaviorAsync(
          "overlay-swipe"
        );
    };
    setThemeStyle();
    let windowEvent = Dimensions.addEventListener(
      "change",
      e => {
        GlobalData.size = { ...e };
      }
    );

    (async () => {
      try {
        loader.show();
        await GlobalData.init();
      } catch (e) {
        console.error(e);
      } finally {
        loader.hide();
      }
    })();

    return () => {
      windowEvent.remove();
    };
  }, []);

  if (loader.loading) return loader.elem;
  return (
    <View
      style={[
        styles.container,
        GlobalData.theme.settings,
        {
          ...(visibility !== "hidden"
            ? GlobalData.size.window
            : GlobalData.size.screen)
        }
      ]}>
      <AppMenu />
      <StatusBar
        style="auto"
        hidden={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  lightContainer: {
    backgroundColor: "#ffffff"
  },
  darkContainer: {
    backgroundColor: "#2b2727"
  },
  lightThemeText: {
    color: "#15181f"
  },
  darkThemeText: {
    color: "#f7f7f6"
  }
});
