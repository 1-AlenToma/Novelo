import {
  removeProps,
  parseThemeStyle,
  StyledView,
  newId,
  invertColor
} from "../Methods";
import {
  useRef,
  useState,
  useEffect
} from "react";
import Icon from "./Icons";
import TouchableOpacity from "./TouchableOpacityView";
import View from "./ThemeView";
import Text from "./ThemeText";
import * as Battery from "expo-battery";
import { useTimer, useUpdate } from "../hooks";

export default ({ color }: any) => {
  const [batteryLevel, setBatteryLevel] =
    useState(0);
  const timer = useTimer(5000);
  const setLvl = async () => {
    const lvl =
      await Battery.getBatteryLevelAsync();
    if (lvl !== null && lvl !== undefined) {
      setBatteryLevel(lvl);
      timer(() => {
        setLvl();
      });
    }
  };
  useEffect(() => {
    setLvl();
  }, []);
  let level = batteryLevel * 100;
  return (
    <View css="wi:30 overflow juc:center ali:center">
      <View
        style={{
          width: level + "%",
          backgroundColor: "#3b5998"
        }}
        css="absolute le:0 flex he:18 bac:#fff zi:1"
      />
      <Icon
        css="zi:2"
        name="battery-empty"
        type="FontAwesome"
        color={invertColor(color)}
        size={25}
      />
      <Text
        style={{ color: invertColor(color) }}
        css="desc fos:8 zi:3 absolute">
        {parseInt(level)}%
      </Text>
    </View>
  );
};
