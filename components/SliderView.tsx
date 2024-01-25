import SliderRange from "@react-native-community/slider";
import {
  removeProps,
  parseThemeStyle,
  StyledView
} from "../Methods";
import { useRef } from "react";
const Slider = StyledView(SliderRange, "Slider");

export default ({
  style,
  children,
  invertColor,
  css,
  ifTrue,
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
    <Slider
      minimumTrackTintColor="#FFFFFF"
      maximumTrackTintColor="#000000"
      step={1}
      {...props}
      onValueChange={change}
      style={st}
      css={css}
    />
  );
};
