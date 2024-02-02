import Text from "./ThemeText";
import View from "./ThemeView";
import Icon from "./Icons";
import Slider from "./SliderView";
import AnimatedView from "./AnimatedView";
import TouchableOpacity from "./TouchableOpacityView";
import { useEffect, useRef } from "react";
import {
  ScrollView,
  Linking,
  PanResponder,
  Animated
} from "react-native";
import {
  useUpdate,
  useTimer,
  useDbHook
} from "../hooks";

export default ({ procent, children }: any) => {
  return (
    <View css="flex clearboth to:0 le:0 absolute zi:30 juc:center overflow ali:center bow:0 boc:#000">
      <View css="zi:2">
        {children || (
          <Text css="fos:18 bold co:red">
            {procent.readAble()}%
          </Text>
        )}
      </View>
      <View
        css="bac:green zi:1 absolute to:0 le:0 clearboth op:0.8"
        style={{
          width: `${procent}%`
        }}></View>
    </View>
  );
};
