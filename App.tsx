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
  LogBox
} from "react-native";
import "./Global.d";
import {
  useLoader,
  AppContainer,
  ActionSheet,
  TouchableOpacity,
  Text,
  Modal,
  PlayerView,
  AlertView
} from "./components";
import GlobalData from "./GlobalContext";
import * as NavigationBar from "expo-navigation-bar";
import { NavigationContainer } from "@react-navigation/native";
import { AppStack } from "./pages";
import { useFonts } from "./hooks";

export default function App() {
  const fontLoader = useFonts();
  GlobalData.hook(
    "size",
    "theme.settings",
    "isFullScreen",
    "updater"
  );

  GlobalData.subscribe((item, props) => {
    NavigationBar.setVisibilityAsync(
      GlobalData.isFullScreen
        ? "hidden"
        : "visible"
    );
    setStatusBarHidden(GlobalData.isFullScreen);
    if (!GlobalData.isFullScreen)
      NavigationBar.setBehaviorAsync(
        "overlay-swipe"
      );
  }, "isFullScreen");
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
    setThemeStyle();
    let itemToRemove = [];
    (async () => {
      try {
        loader.show();
        itemToRemove = await GlobalData.init();
        GlobalData.isFullScreen = false;
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
if (fontLoader.loading) return fontLoader.elem;
  return (
    <AppContainer>
      <NavigationContainer>
        <AppStack />
        <PlayerView />
      </NavigationContainer>
      <StatusBar
        style={
          GlobalData.theme.themeMode == "light"
            ? "dark"
            : "light"
        }
      />
      <AlertView />
    </AppContainer>
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
