import { View, AnimatedView, Text, TouchableOpacity, Icon, ScrollView, ActionSheet } from "react-native-short-style";
import * as React from "react";
import { useAnimate, useView } from "../hooks";
import { ISize } from "../Types";
import { Easing } from "react-native";
import { SingleTouchableOpacity } from "./SingleTouchableOpacity";


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
  disableLongPress,
  css,
  position,
  ...props
}: {
  buttons: Buttons[];
  disableLongPress?: boolean
  children: any;
  value?: any;
  single: any;
  enabled?: boolean,
  css?: string;
  position?: "Left" | "Top"
}) => {
  const pos = position ?? "Top";

  const { animateX, animateY, animate } = useAnimate({
    easing: Easing.bounce
  });
  const [render, state, loader] = useView({
    component: View,
    state: {
      visible: false,
      longPressVisible: false,
      buttonsSize: undefined as ISize | undefined,
      childSize: undefined as ISize | undefined
    }
  });
  let interpolate = [0, 1];
  if (pos == "Left") {
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
  } else {
    if (
      state.buttonsSize &&
      (state.childSize?.height as number ?? 0) > 0 &&
      !isNaN(state.size.height as number)
    ) {
      interpolate = [0, -Math.max((state.childSize?.height as number) - 1, 10)];
    }
  }

  const animateView = (show: boolean) => {
    (pos == "Left" ? animateX : animateY)(interpolate[show ? 0 : 1], () => {
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
  }

  if (single) {
    context.useEffect(() => {
      if (state.id != context.selectedFoldItem && state.visible) {
        animateView(false);
      }
    }, "selectedFoldItem");
  }

  let scrollButoons = Array.isArray(buttons) ? buttons : [buttons];

  scrollButoons = [{
    onPress: () => {
      animateView(false);
    },
    icon: (<Icon type="FontAwesome" name="close" css="co-red" />),
    text: "Close"
  }, ...scrollButoons]

  return render(
    <>
      <View
        onPress={() => alert("jkshad")}
        style={{
          height: ((state.childSize?.height ?? 0) as number) - 10,
          width: "100%"
        }}
        css="wi:98% ri:5 to:5 overflow:visible bor:5 absolute zi:1 ali:flex-end juc:flex-end">
        {!disableLongPress ? (
          <ActionSheet size={"50%"} isVisible={state.longPressVisible} onHide={() => state.longPressVisible = false}>
            <ScrollView
              style={{ maxWidth: "100%" }}
              showsVerticalScrollIndicator={true}
              css="zi:1 clearheight">
              {Array.isArray(buttons)
                ? [...buttons].reverse().map((x, i) => (
                  <SingleTouchableOpacity
                    css={`invert settingButton`}
                    ifTrue={x.ifTrue}
                    onPress={async () => {
                      if (await x.onPress())
                        state.longPressVisible = false;
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
                  </SingleTouchableOpacity>
                ))
                : buttons}
            </ScrollView>
          </ActionSheet>
        ) : null}
        <ScrollView horizontal={true}
          onContentSizeChange={(width, height) => {
            state.buttonsSize = { width, height } as any
          }}
          style={{ maxWidth: "100%" }}
          showsHorizontalScrollIndicator={true}
          onLayout={event => {
            // state.buttonsSize = event.nativeEvent.layout;
          }}
          contentContainerStyle={{ paddingLeft: 5, paddingRight: 5 }}
          css="zi:1 clearheight">
          {scrollButoons.map((x, i) => (
            <SingleTouchableOpacity
              css={`mar:5 miw:50 juc:center ali:center bor:5 pa:10 he:95% invert ${i == value ? "selectedRow" : ""}`}
              ifTrue={x.ifTrue}
              onPress={async () => {
                if (await x.onPress())
                  animateView(false);
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
            </SingleTouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <AnimatedView
        css="clearboth zi:2 "
        style={{
          transform: [
            pos == "Left" ? (
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
            ) : ({
              translateY: animate.y.interpolate({
                inputRange: interpolate.sort(
                  (a, b) => a - b
                ),
                outputRange: interpolate,
                extrapolateLeft: "extend",
                extrapolate: "clamp"
              })
            })
          ]
        }}>
        <SingleTouchableOpacity
          onLayout={event => {
            state.childSize = event.nativeEvent.layout;
          }}
          activeOpacity={0.9}
          onLongPress={(e) => {
            e.stopPropagation();
            e.preventDefault();
            state.longPressVisible = true;

          }}
          onPress={() => {
            if (enabled !== false)
              animateView(!state.visible)
          }}>
          {children}
        </SingleTouchableOpacity>
      </AnimatedView>
    </>,
    {
      css,
      ...props
    }
  );
};
