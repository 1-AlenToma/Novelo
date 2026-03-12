import * as React from "react";
import { Dimensions, ColorValue } from "react-native";
import { Icon, View } from "react-native-short-style";
import { PlayerView } from "../components";
import Home from "./Home";
import Favorit from "./Favorit";
import Settings from "./Settings";
import Downloaded from "./Downloaded";
import Libraries from "./Libraries";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();


export default ({ ...props }) => {
  context.hook("selectedThemeIndex");

  const themeBackground = context.selectedThemeIndex == 1 ? "#000" : "#ffffff";
  const activeColor = context.selectedThemeIndex !== 1 ? "#000" : "#ffffff";
  const getColor = (focus: boolean) => (focus ? "#007AFF" : activeColor) as ColorValue;

  return (
    <View style={{ flex: 1 }} css="root">
      <Tab.Navigator
        id="main-tabs"
        initialRouteName="HOME"
        tabBarPosition="bottom"          // place tab bar at bottom
        screenOptions={({ route }) => ({
          swipeEnabled: true,           // enable swipe gestures
          tabBarIndicatorStyle: {
            backgroundColor: "#007AFF", // indicator color
            height: 2,
            position: "absolute",
            top: 0,                      // make it appear above the icons
          },
          lazy: true,
          tabBarShowIcon: true,
          tabBarStyle: {
            backgroundColor: themeBackground,
            height: 50,
            elevation: 0,
            borderTopWidth: 0,
          },
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: activeColor,
          tabBarLabelStyle: {
            fontSize: 8,
            textTransform: "capitalize",
            margin: 0,
            padding: 0,
            fontWeight: "bold",
            position:"relative",
            top: -4
          },
          tabBarIcon: ({ focused, color }) => {
            let iconName = "";
            let iconType: any = "Entypo";
            let size = 17;

            switch (route.name) {
              case "HOME":
                iconName = "home";
                iconType = "Entypo";
                break;
              case "FAVORIT":
                iconName = "favorite";
                iconType = "MaterialIcons";
                break;
              case "DOWNLOADS":
                iconName = "download-for-offline";
                iconType = "MaterialIcons";
                break;
              case "SOURCES":
                iconName = "extension";
                iconType = "MaterialIcons";
                break;
              case "SETTINGS":
                iconName = "settings";
                iconType = "Ionicons";
                break;
            }

            return (
              <Icon
                type={iconType}
                name={iconName}
                style={{ color: getColor(focused), fontSize: size }}
                color={color}
                size={size}
              />
            );
          },
        })}
      >
        <Tab.Screen name="HOME">{() => <Home {...props} />}</Tab.Screen>
        <Tab.Screen name="FAVORIT">{() => <Favorit {...props} />}</Tab.Screen>
        <Tab.Screen name="DOWNLOADS">{() => <Downloaded {...props} />}</Tab.Screen>
        <Tab.Screen name="SOURCES">{() => <Libraries {...props} />}</Tab.Screen>
        <Tab.Screen name="SETTINGS">{() => <Settings {...props} />}</Tab.Screen>
      </Tab.Navigator>

      {/* Footer Player */}
      <PlayerView isMenu={true} />
    </View>
  );
};