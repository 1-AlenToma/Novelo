import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ReadChapter from "./groups/ReadChapter";
import AppMenu from "./AppMenu";
import GroupDetail from "./groups/GroupDetail";
import NovelItemDetail from "./groups/NovelItemDetail";
import Search from "./groups/Search";
import WatchAnime from "./groups/WatchAnime";

const Stack = createNativeStackNavigator();


export default () => {
  return (
    <Stack.Navigator
      initialRouteName="AppMenu"
      screenOptions={{
        headerShown: false
      }}>

      <Stack.Screen
        name="WatchAnime"
        component={WatchAnime}
      />

      <Stack.Screen
        name="AppMenu"
        component={AppMenu}
      />

      <Stack.Screen
        name="GroupDetail"
        component={GroupDetail}
      />

      <Stack.Screen
        name="NovelItemDetail"
        component={NovelItemDetail}
      />

      <Stack.Screen
        name="Search"
        component={Search}
      />

      <Stack.Screen
        name="ReadChapter"
        component={ReadChapter}
      />
    </Stack.Navigator>
  );
};
