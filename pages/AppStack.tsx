import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppMenu from "./AppMenu";
import GroupDetail from "./groups/GroupDetail";
import NovelItemDetail from "./groups/NovelItemDetail";

const Stack = createNativeStackNavigator();

export default () => {
  return (
    <Stack.Navigator
      initialRouteName="AppMenu"
      screenOptions={{
        headerShown: false
      }}>
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
    </Stack.Navigator>
  );
};
