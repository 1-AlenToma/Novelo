import SliderRange from "@react-native-community/slider";
import {
  removeProps,
  parseThemeStyle,
  StyledView,
  newId
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
  let st = parseThemeStyle(
    style,
    undefined,
    invertColor
  );

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
      css={`
        ${buttons
          ? "wi:90%"
          : "clearwidth"} mah:40 row di:flex ali:center jus:center
      `}>
      {buttons ? (
        <TouchableOpacity
          css="flex maw:24 mal:10"
          onPress={() => {
            let step = (1).sureValue(props.step);
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
            invertColor={invertColor}
            name="minus-square"
            type="FontAwesome"
            size={24}
          />
        </TouchableOpacity>
      ) : null}
      <View
        css="bac:#fff wi:35 he:20 pal:5 par:5 juc:center ali:center"
        ifTrue={() => renderValue == true}>
        <Text
          invertColor={false}
          css="bold fos:10 tea:center">
          {(0).sureValue(value).readAble()}
        </Text>
      </View>
      <View
        css={`flex ${buttons ? "maw:48%" : ""} ${
          css ?? ""
        }`}>
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
            ) {
              let v = props.value + step;
              props.onValueChange?.(v) ??
                props.onSlidingComplete?.(v);
            }
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
