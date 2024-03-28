import "./Global.d";
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

import {
  useLoader,
  AppContainer,
  ActionSheet,
  TouchableOpacity,
  Text,
  Modal,
  PlayerView,
  AlertView,
  CheckBox
} from "./components";
import * as NavigationBar from "expo-navigation-bar";
import { NavigationContainer } from "@react-navigation/native";
import { AppStack } from "./pages";
import { useFonts } from "./hooks";
import { clearStyles } from "./styles";

export default function App() {
  const fontLoader = useFonts();
  context.hook(
    "size",
    "theme.settings",
    "isFullScreen",
    "updater"
  );

  context.subscribe(
    (item, props) => {
      NavigationBar.setVisibilityAsync(
        context.isFullScreen &&
          !context.KeyboardState
          ? "hidden"
          : "visible"
      );
      setStatusBarHidden(context.isFullScreen);
      if (!context.isFullScreen)
        NavigationBar.setBehaviorAsync(
          "overlay-swipe"
        );
    },
    "isFullScreen",
    "KeyboardState"
  );

  const visibility =
    NavigationBar.useVisibility();
  const loader = useLoader(true);

  const setThemeStyle = () => {
    const colorScheme = context.theme.themeMode;
    const themeTextStyle =
      colorScheme === "light"
        ? styles.lightThemeText
        : styles.darkThemeText;
    const themeContainerStyle =
      colorScheme === "light"
        ? styles.lightContainer
        : styles.darkContainer;
    context.theme.getRootTheme = (theme: any) => {
      theme = theme || context.theme.themeMode;

      return {
        ...(theme == "light"
          ? styles.lightRootTheme
          : styles.darkRootTheme)
      };
    };
    context.theme.invertSettings = () => {
      return context.theme.themeMode == "light"
        ? {
            ...styles.darkContainer,
            ...styles.darkThemeText
          }
        : {
            ...styles.lightContainer,
            ...styles.lightThemeText
          };
    };
    clearStyles();
    context.theme.settings = {
      ...themeTextStyle,
      ...themeContainerStyle
    };
  };

  context.subscribe(() => {
    setThemeStyle();
  }, "theme.themeMode");

  useEffect(() => {
    setThemeStyle();
    let itemToRemove = [];
    (async () => {
      try {
        loader.show();
        itemToRemove = await context.init();
        context.isFullScreen = false;
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
  //context.alert("test").toast();
  return (
    <AppContainer>
      <NavigationContainer>
        <AppStack />
        <PlayerView />
      </NavigationContainer>
      <StatusBar
        style={
          context.theme.themeMode == "light"
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
  },
  darkRootTheme: {
    backgroundColor: "#383838"
  },
  lightRootTheme: {
    backgroundColor: "#ffffff"
  }
});
