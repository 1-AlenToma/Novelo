import {
  invertColor
} from "../Methods";
import * as React from "react";
import { View, Text, Icon } from "./ReactNativeComponents";
import * as Battery from "expo-battery";
import useTimer from "../hooks/Timer";

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
  let height = 24;
  let level = batteryLevel * 100;
  //level=100;
  return (
    <View css="wi:26 mal:5 overflow juc:center ali:center clb">
      <View
        style={{
          height: height - 14,
          width: (level - (level > 30 ? 15 : 0) + "%") as any,
          backgroundColor: "#3b5998"
        }}
        css="absolute le:1 bor:2 flex he:11 bac:#fff zi:1 clb"
      />
      <Icon
        css="zi:2"
        name="battery-empty"
        type="Fontisto"
        color={invertColor(color)}
        size={height}
      />
      <Text
        style={{ color: invertColor(color) }}
        css="desc fos:8 zi:3 absolute">
        {parseInt(Math.min(level, 99).toString())}%
      </Text>
    </View>
  );
};
