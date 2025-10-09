import { View, AnimatedView, Text, TouchableOpacity, Icon, ScrollView } from "react-native-short-style";
import * as React from "react";
import { useAnimate, useView } from "../hooks";
import { ISize } from "../Types";
import { Easing } from "react-native";


type Buttons = {
  onPress: Function;
  icon: ((typeof Icon) | (React.ReactElement));
  text?: string;
  ifTrue?: any;
};
export default ({
  children,
  buttons,
  value,
  single,
  enabled,
  css,
  ...props
}: {
  buttons: Buttons[];
  children: any;
  value?: any;
  single: any;
  enabled?: boolean,
  css?: string;
}) => {
  let btn = buttons.filter(
    x => methods.ifSelector(x.ifTrue) !== false
  );

  const { animateX, animate } = useAnimate({
    easing: Easing.bounce
  });
  const [render, state, loader] = useView({
    component: View,
    state: {
      visible: false,
      buttonsSize: undefined as ISize | undefined,
      childSize: undefined as ISize | undefined
    }
  });
  let interpolate = [0, 1];
  if (
    state.buttonsSize &&
    state.size.width > 0 &&
    !isNaN(state.buttonsSize.width as number)
  ) {
    interpolate = [
      0,
      -Math.max((state.buttonsSize.width as number) + 10, 10)
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
    context.useEffect(() => {
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
          height: ((state.childSize?.height ?? 0) as number) - 10,
          width: state.buttonsSize?.width ?? 0
        }}
        css="wi:98% ri:5 to:5 overflow bor:5 absolute zi:1 ali:flex-end juc:flex-end">

        <ScrollView horizontal={true}
          onContentSizeChange={(width, h) => {
            state.buttonsSize = { width } as any
          }}
          style={{ maxWidth: "100%" }}
          showsHorizontalScrollIndicator={true}
          onLayout={event => {
            // state.buttonsSize = event.nativeEvent.layout;
          }}
          css="zi:1 clearheight">
          {Array.isArray(buttons)
            ? buttons.map((x, i) => (
              <TouchableOpacity
                css={`mar:5 miw:50 juc:center ali:center bor:5 pa:10 he:95% invert ${i == value
                  ? "selectedRow"
                  : ""
                  }`}
                ifTrue={x.ifTrue}
                onPress={() => {
                  if (x.onPress())
                    animateLeft(false);
                }}
                key={i}>
                {x.icon as any}
                <Text
                  css="desc invertco"
                  ifTrue={() =>
                    x.text?.has() ?? false
                  }>
                  {x.text}
                </Text>
              </TouchableOpacity>
            ))
            : buttons}
        </ScrollView>
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
            state.childSize = event.nativeEvent.layout;
          }}
          activeOpacity={0.9}
          onPress={() => {
            if (enabled !== false)
              animateLeft(!state.visible)
          }}>
          {children}
        </TouchableOpacity>
      </AnimatedView>
    </>,
    {
      css,
      ...props
    }
  );
};
