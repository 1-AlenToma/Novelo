import { TabItemProps, TabView, ifSelector, ScrollView } from "react-native-short-style"
import * as React from "react";
import { ColorValue } from "react-native";
import { Icon, View } from "react-native-short-style";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from "@react-navigation/native";

const Tab = createMaterialTopTabNavigator();

export const Tabbs = ({ children, position, lazyLoading, css }: { children: React.ReactElement<TabItemProps>[], position: "Top" | "Bottom", lazyLoading: boolean, css?: any }) => {
  const themeBackground = context.selectedThemeIndex == 1 ? "#000" : "#ffffff";
  const activeColor = context.selectedThemeIndex !== 1 ? "#000" : "#ffffff";
  const getColor = (focus: boolean) => (focus ? "#007AFF" : activeColor) as ColorValue;
  const visibleChildren = children.filter(child => ifSelector(child.props.ifTrue) !== false);
  return (
    <NavigationContainer>
      <View style={{ flex: 1 }} css={"root" + css}>
        <Tab.Navigator
          id="main-tabs"
          initialRouteName="0"

          tabBarPosition={position === "Top" ? "top" : "bottom"}          // place tab bar at top or bottom
          screenOptions={({ route }) => ({
            swipeEnabled: true,           // enable swipe gestures
            tabBarIndicatorStyle: position !== "Bottom" ? undefined : {
              backgroundColor: "#007AFF", // indicator color
              height: 2,
              position: "absolute",
              top: 0,                      // make it appear above the icons
            },
            lazy: lazyLoading,
            tabBarShowIcon: true,
            tabBarShowLabel: false,
            tabBarStyle: {
              backgroundColor: themeBackground,
              height: 40,
              elevation: 0,
              borderTopWidth: 0,
              display: visibleChildren.length <= 1 ? "none" : undefined
            },
            tabBarActiveTintColor: activeColor,
            tabBarInactiveTintColor: activeColor,
            tabBarLabelStyle: {
              fontSize: 8,
              textTransform: "capitalize",
              margin: 0,
              padding: 0,
              fontWeight: "bold",
              position: "relative",
              top: -4
            },
            tabBarIcon: ({ focused, color }) => {
              let iconName = "";
              let iconType: any = "Entypo";
              let size = 17;
              let item: any = visibleChildren[parseInt(route.name)];
              if (!item) return null;
              iconName = item.props.icon.name;
              iconType = item.props.icon.type || "Entypo";


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
          {
            visibleChildren.map((child, index) => (
              <Tab.Screen key={index} name={index.toString()}>
                {() => (<ScrollView css={child.props.css} style={{ flex: 1 }} contentContainerStyle={{ backgroundColor: "transparent" }}>{child}</ScrollView>)}
              </Tab.Screen>
            ))
          }
        </Tab.Navigator>
      </View>
    </NavigationContainer>
  )
}