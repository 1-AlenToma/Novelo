import {
  StatusBar,
  setStatusBarHidden
} from "expo-status-bar";
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
import * as NavigationBar from "expo-navigation-bar";
import { NavigationContainer } from "@react-navigation/native";
import { AppStack } from "./pages";

LogBox.ignoreLogs([/require cycle/gim]);
export default function App() {
  GlobalData.hook(
    "size",
    "theme.settings",
    "isFullScreen"
  );
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
        v ? "hidden" : "visible"
      );
      setStatusBarHidden(v);
      if (!v)
        NavigationBar.setBehaviorAsync(
          "overlay-swipe"
        );
    };
    setThemeStyle();
let itemToRemove = [];
    (async () => {
      try {
        loader.show();
        itemToRemove = await GlobalData.init();
        GlobalData.fullscreen(false);
      } catch (e) {
        console.error(e);
      } finally {
        loader.hide();
      }
    })();

    return () => {
      itemToRemove?.forEach(x => x.remove());
    };
  }, []);

  if (loader.loading) return loader.elem;
  return (
    <>
      <StatusBar
        style={
          GlobalData.theme.themeMode == "light"
            ? "dark"
            : "light"
        }
      />
      <NavigationContainer>
        <AppStack />
      </NavigationContainer>
    </>
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
