import {
  invertColor
} from "../Methods";
import * as React from "react";
import { View, Text, Icon } from "react-native-short-style";
import DeviceInfo from 'react-native-device-info';
import useTimer from "../hooks/Timer";
import { PrimitiveObject } from "react-smart-state";

export default ({ color }: any) => {
  const { mem } = useFunc();
  const batteryLevel = PrimitiveObject(0);
  const timer = useTimer(5000);
  const setLvl = mem(async () => {
    const lvl = await DeviceInfo.getBatteryLevel();
    if (lvl !== null && lvl !== undefined) {
      batteryLevel.value = lvl;
      timer(() => {
        setLvl();
      });
    }
  });

  useEffect(() => {
    setLvl();
  }, []);
  let height = 24;
  let level = batteryLevel.value * 100;
  //level=100;
  return (
    <View css="wi:26 mal:5 overflow juc:center ali:center clb">
      <View
        style={mem({
          height: height - 14,
          width: (level - (level > 30 ? 15 : 0) + "%") as any,
          backgroundColor: "#3b5998"
        }, level, height)}
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
        style={mem({ color: invertColor(color) }, color)}
        css="desc fos:8 zi:3 absolute">
        {parseInt(Math.min(level, 99).toString())}%
      </Text>
    </View>
  );
};
