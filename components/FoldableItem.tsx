import View from "./ThemeView";
import Text from "./ThemeText";
import Icon from "./Icons";

import { useEffect, useRef } from "react";
import {
  PanResponder,
  Animated
} from "react-native";
import TouchableOpacity from "./TouchableOpacityView";
import AnimatedView from "./AnimatedView";
import { useAnimate, useView } from "../hooks";

type Buttons = {
  onPress: Function;
  icon: Icon;
  text?: string;
  ifTrue: any;
};
export default ({
  children,
  buttons,
  value,
  single,
  ...props
}: {
  buttons: Buttons;
  children: any;
}) => {
  let btn = buttons.filter(
    x => methods.ifSelector(x.ifTrue) !== false
  );

  const { animateX, animate } = useAnimate();
  const [render, state, loader] = useView({
    component: View,
    state: {
      visible: false,
      buttonsSize: undefined,
      childSize: undefined
    }
  });
  let interpolate = [0, 1];
  if (
    state.buttonsSize &&
    state.size.width > 0 &&
    !isNaN(state.buttonsSize.width)
  ) {
    interpolate = [
      0,
      -Math.max(state.buttonsSize.width + 10, 10)
    ];
  }

  const animateLeft = (show: boolean) => {
    animateX(interpolate[show ? 0 : 1], () => {
      state.visible = show;
      if (single && show) {
        context.selectedFoldItem = state.id;
      } else if (
        single &&
        !show &&
        context.selectedFoldItem == state.id
      ) {
        context.selectedFoldItem = "";
      }
    });
  };

  if (single) {
    context.subscribe(() => {
      if (
        state.id != context.selectedFoldItem &&
        state.visible
      ) {
        animateLeft(false);
      }
    }, "selectedFoldItem");
  }

  return render(
    <>
      <View
        style={{
          height:
            (state.childSize?.height ?? 0) - 10,
          width: state.buttonsSize?.width ?? 0
        }}
        css="wi:98% ri:5 to:5 overflow bor:5 absolute zi:1 ali:flex-end juc:flex-end">
        <View
          onLayout={event => {
            state.buttonsSize =
              event.nativeEvent.layout;
          }}
          css="row zi:1 clearheight">
          {Array.isArray(buttons)
            ? buttons.map((x, i) => (
                <TouchableOpacity
                  invertColor={true}
                  css={`mar:5 miw:50 juc:center ali:center bor:5 pa:10 he:95% ${
                    i == value
                      ? "selectedRow"
                      : ""
                  }`}
                  ifTrue={x.ifTrue}
                  onPress={() => {
                    if (x.onPress())
                      animateLeft(false);
                  }}
                  key={i}>
                  {x.icon}
                  <Text
                    invertColor={true}
                    css="desc"
                    ifTrue={() =>
                      x.text?.has() ?? false
                    }>
                    {x.text}
                  </Text>
                </TouchableOpacity>
              ))
            : buttons}
        </View>
      </View>
      <AnimatedView
        css="clearboth zi:2 "
        style={{
          transform: [
            {
              translateX: animate.x.interpolate({
                inputRange: interpolate.sort(
                  (a, b) => a - b
                ),
                outputRange: interpolate,
                extrapolateLeft: "extend",
                extrapolate: "clamp"
              })
            }
          ]
        }}>
        <TouchableOpacity
          onLayout={event => {
            state.childSize =
              event.nativeEvent.layout;
          }}
          activeOpacity={0.9}
          onPress={() =>
            animateLeft(!state.visible)
          }>
          {children}
        </TouchableOpacity>
      </AnimatedView>
    </>,
    {
      ...props
    }
  );
};
