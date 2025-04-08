import SliderRange from "@react-native-community/slider";
import {
  StyledView,
  invertColor as InvertColor
} from "../Methods";
import * as React from "react";
import { View, Text, TouchableOpacity, Icon } from "./ReactNativeComponents";
import { globalData } from "react-native-short-style/dist/demo/src/theme/ThemeContext";
const Slider = StyledView(SliderRange, "Slider");

export default ({
  style,
  children,
  invertColor,
  css,
  ifTrue,
  buttons,
  disableTimer,
  renderValue,
  ...props
}: any) => {
  const timer = useRef();
  const [value, setValue] = useState(props.value);
  if (ifTrue === false) return null;

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const change = (v: any) => {
    setValue(v);
    if (disableTimer) {
      props.onValueChange?.(v);
      return;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      props.onValueChange?.(v);
    }, 100);
  };
  return (
    <View
      css={`clearwidth mah:40 row ali:center juc:space-between invert ${css}`}>
      <>
        {buttons ? (
          <TouchableOpacity
            css="flex maw:24 mal:10"
            onPress={() => {
              let step = props.step ?? 1;
              if (
                props.value - step >=
                props.minimumValue
              ) {
                let v = props.value - step;
                props.onValueChange?.(v) ??
                  props.onSlidingComplete?.(v);
              }
            }}>
            <Icon
              name="minus-square"
              type="FontAwesome"
              size={24}
            />
          </TouchableOpacity>
        ) : null}
        <View
          css="wi:35 he:20 pal:5 par:5 juc:center ali:center invert"
          ifTrue={() => renderValue == true}>
          <Text
            css="desc fos:10 tea:center">
            {(0).sureValue(value).readAble()}
          </Text>
        </View>
        <View css={`flex`}>
          <Slider
            onStartShouldSetResponder={event =>
              false
            }
            onTouchStart={e => {
              globalData.panEnabled = false;
            }}
            onTouchEnd={e => {
              globalData.panEnabled = true;
            }}
            minimumTrackTintColor="#f17c7c"
            maximumTrackTintColor="#000000"
            step={1}
            {...props}
            onValueChange={change}
            style={style}
            css={css}
          />
        </View>
        {buttons ? (
          <TouchableOpacity
            css="flex maw:24"
            onPress={() => {
              let step = props.step ?? 1;
              if (
                props.value + step <=
                props.maximumValue
              ) {
                let v = props.value + step;
                props.onValueChange?.(v) ??
                  props.onSlidingComplete?.(v);
              }
            }}>
            <Icon
              name="plus-square"
              type="FontAwesome"
              size={24}
            />
          </TouchableOpacity>
        ) : null}
      </>
    </View>
  );
};
