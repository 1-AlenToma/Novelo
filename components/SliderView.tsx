import SliderRange from "@react-native-community/slider";
import {
  removeProps,
  parseThemeStyle,
  StyledView
} from "../Methods";
import { useRef } from "react";
import Icon from "./Icons";
import TouchableOpacity from "./TouchableOpacityView";
import View from "./ThemeView";
const Slider = StyledView(SliderRange, "Slider");

export default ({
  style,
  children,
  invertColor,
  css,
  ifTrue,
  buttons,
  ...props
}: any) => {
  const timer = useRef();
  if (ifTrue === false) return null;
  let st = parseThemeStyle(
    style,
    undefined,
    invertColor
  );
  const change = (v: any) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      props.onValueChange?.(v);
    }, 100);
  };
  return (
    <View css={`${buttons ? "wi:90%" : "clearwidth"} mah:40 row di:flex ali:center jus:center`}>
      {buttons ? (
        <TouchableOpacity
          css="flex maw:24 mal:10"
          onPress={() => {
            let step = (1).sureValue(props.step);
            if (
              props.value - step >=
              props.minimumValue
            )
              change(props.value - step);
          }}>
          <Icon
            invertColor={invertColor}
            name="minus-square"
            type="FontAwesome"
            size={24}
          />
        </TouchableOpacity>
      ) : null}
      <View
        css={`flex ${buttons ? "maw:60%" : ""}`}>
        <Slider
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
          step={1}
          {...props}
          onValueChange={change}
          style={st}
          css={css}
        />
      </View>
      {buttons ? (
        <TouchableOpacity
          css="flex maw:24"
          onPress={() => {
            let step = (1).sureValue(props.step);
            if (
              props.value + step <=
              props.maximumValue
            )
              change(props.value + step);
          }}>
          <Icon
            invertColor={invertColor}
            name="plus-square"
            type="FontAwesome"
            size={24}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
