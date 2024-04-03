import {
  useContext,
  useState,
  useEffect,
  useRef
} from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Easing,
  PanResponder
} from "react-native";

export default ({
  y,
  x,
  speed,
  useNativeDriver = true
}: any) => {
  const animate = useRef(
    new Animated.ValueXY({
      y: y ?? 0,
      x: x ??0 
    })
  ).current;

  const animating = useRef();
  const animateY = (
    value: any,
    onFinished?: Function,
    sp?: any
  ) => {
    run(
      value,
      animate.y,
      () => {
        animate.setValue({ y: value, x: 0 });
        animate.flattenOffset();
        onFinished?.();
      },
      sp
    );
  };

  const animateX = (
    value: any,
    onFinished?: Function,
    sp?: any
  ) => {
    run(
      value,
      animate.x,
      () => {
        animate.setValue({ y: 0, x: value });
        animate.flattenOffset();
        onFinished?.();
      },
      sp
    );
  };

  const run = (
    value: any,
    animObject: any,
    onFinished?: Function,
    sp?: any
  ) => {
    animating.current?.stop?.();
    animating.current = Animated.timing(
      animObject,
      {
        toValue: value,
        duration: sp ?? speed ?? 300,
        easing: Easing.linear,
        useNativeDriver: useNativeDriver
      }
    );
    animating.current.start(() => {
      onFinished?.();
    });
  };

  return { animateY, animateX, run, animate };
};
