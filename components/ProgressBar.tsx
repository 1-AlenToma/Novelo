import Text from "./ThemeText";
import View from "./ThemeView";
import Icon from "./Icons";
import Slider from "./SliderView";
import AnimatedView from "./AnimatedView";
import TouchableOpacity from "./TouchableOpacityView";
import {
  useEffect,
  useRef,
  useState
} from "react";
import {
  ScrollView,
  Linking,
  PanResponder,
  Animated
} from "react-native";
import {
  useUpdate,
  useTimer,
  useDbHook,
  useAnimate
} from "../hooks";
import { ifSelector } from "../Methods";

export default ({
  procent,
  children,
  ifTrue,
  text,
  color,
  speed
}: any) => {
  if (ifSelector(ifTrue) === false) return null;
  const [size, setSize] = useState();
  const { animate, animateX } = useAnimate({
    speed:speed ?? 50
  });
  const applyProc = () => {
    if (size)
      animateX(
        Math.round(
          methods.proc(
            Math.round(procent),
            size.width
          )
        )
      );
  };
  useEffect(() => {
    applyProc();
  }, [procent]);
  useEffect(() => {
    applyProc();
  }, [size]);

  let bound = [];
  for (let i = 0; i <= 100; i++) {
    bound.push(
      Math.round(
        methods.proc(i, size?.width ?? 100)
      )
    );
  }

  return (
    <View
      onLayout={e => {
        setSize(e.nativeEvent.layout);
      }}
      css="flex clearboth to:0 le:0 absolute zi:5 juc:center overflow ali:center bow:0 boc:#000">
      <View css="clearboth blur zi:1 absolute" />
      <View
        css="zi:3"
        ifTrue={text}>
        {children || (
          <Text css="fos:18 bold co:red">
            {procent?.readAble()}%
          </Text>
        )}
      </View>
      <AnimatedView
        css="zi:2 absolute to:0 le:-100% clearboth op:0.8"
        style={{
          backgroundColor: color ?? "green",
          transform: [
            {
              translateX: animate.x.interpolate({
                inputRange: bound,
                outputRange: bound,
                extrapolate: "clamp"
              })
            }
          ]
        }}
      />
    </View>
  );
};
