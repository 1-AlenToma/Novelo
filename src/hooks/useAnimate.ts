import * as React from "react";

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
}: any={}) => {
  const currentValue = useRef({
    x: undefined,
    y: undefined
  }).current;
  const animate = useRef(
    new Animated.ValueXY({
      y: y ?? 0,
      x: x ?? 0
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
        currentValue.y = value;
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
        currentValue.x = value;
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
    try{
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
  }catch{
    console.error("animObject",animObject)
  }
  };

  return {
    animateY,
    animateX,
    run,
    animate,
    currentValue
  };
};
