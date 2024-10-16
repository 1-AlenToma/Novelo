import Icon from "./Icons";
import { View, AnimatedView, Text, TouchableOpacity, ScrollView } from "./ReactNativeComponents";
import { ElementsContext } from "./AppContainer";
import { proc, sleep, newId } from "../Methods";
import * as React from "react";
import Constants from "expo-constants";
import {
  useContext
} from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Easing,
  PanResponder
} from "react-native";
import {
  useUpdate,
  useAnimate,
  useView
} from "../hooks";
export default ({
  title,
  height,
  children,
  visible,
  onHide,
  speed,
  ready,
  toTop,
  ...props
}: {
  speed?: number;
  children?: any;
  title?: any;
  height: any;
  visible: any;
  onHide?: () => void;
  toTop?: boolean;
  ready?: boolean
}) => {
  let getHeight = () => {
    let h = height;
    if ((typeof h === "string")) {
      h = proc(
        parseFloat(
          (h?.toString() ?? "0").replace(/%/g, "")
        ),
        context.size.window.height
      );
    }
    if (typeof h === "number" && h < 400) h = 400;

    return Math.min(h, proc(elContext.containerSize().height, 80));
  };

  let elContext = useContext<any>(ElementsContext);
  context.hook("size")
  const { animateY, animate } = useAnimate({
    y: -getHeight(),
    speed
  });
  const [render, state, loader] = useView({
    component: AnimatedView,

    onTouchEnd: () => (state.refItem.isTouched = false),
    state: {

    },
    refItem: {
      startValue: 0,
      isVisible: false,
      panResponse: undefined,
      isTouched: false,
      interpolate: [],
      show: false
    }
  });



  const setSize = () => {
    let containerHeight = elContext.containerSize().height;
    state.refItem.interpolate = [
      containerHeight,
      containerHeight - Math.max(getHeight(), state.size.height)
    ].reverse();
  };
  setSize();

  let toggle = async (show: boolean) => {
    if (!state.refItem.isVisible && show)
      renderUpdate();
    animateY(
      state.refItem.interpolate[!show ? 1 : 0],
      () => {
        state.refItem.panResponse = undefined;
        state.refItem.show = show;
        if (state.refItem.isVisible && !show) {
          onHide?.();
          renderUpdate();
        } else renderUpdate();
      }
    );
  };

  context.useEffect(() => {
    setSize();
    if (state.refItem.isVisible) {
      state.refItem.panResponse = undefined;
      renderUpdate();
      //animate.flattenOffset();
      animateY(
        state.refItem.interpolate[0],
        () => { },
        0
      );
    }
  }, "size");

  if (typeof visible === "function")
    context.useEffect(() => {
      toggle(visible());
    }, "selection");
  if (typeof visible !== "function")
    useEffect(() => {
      toggle(visible);
    }, [visible]);

  useEffect(() => {
    return () => {
      elContext.remove(state.id);
      elContext.update();
    };
  }, []);

  const renderUpdate = () => {
    if (typeof visible == "function")
      state.refItem.isVisible = visible();
    else state.refItem.isVisible = visible;
    if (!state.refItem.panResponse) {
      state.refItem.panResponse =
        PanResponder.create({
          onMoveShouldSetPanResponder: (
            evt,
            gestureState
          ) => {
            const { dx, dy } = gestureState;
            return (
              state.refItem.isTouched &&
              (dx > 2 ||
                dx < -2 ||
                dy > 2 ||
                dy < -2)
            );
          },
          onPanResponderGrant: (
            e,
            gestureState
          ) => {
            state.refItem.startValue =
              gestureState.dy;
            animate.setValue({
              x: 0,
              y: state.refItem.interpolate[0]
            });
            animate.extractOffset();
            return true;
          },
          onPanResponderMove: Animated.event(
            [
              null,
              { dx: animate.x, dy: animate.y }
            ],
            { useNativeDriver: false }
          ),
          onPanResponderRelease: (
            evt,
            gestureState
          ) => {
            let old =
              state.refItem.interpolate[0];
            let newValue = gestureState.dy;
            let diff =
              newValue - state.refItem.startValue;

            if (
              Math.abs(diff) >
              getHeight() / 3
            ) {
              toggle(false);
            } else {
              animate.flattenOffset();
              animateY(old); // reset to start value
            }
            return false;
          }
        });
    }
    let inputRange = [
      ...state.refItem.interpolate
    ].sort((a, b) => a - b);
    let op = !elContext.has(state.id)
      ? elContext.push.bind(elContext)
      : elContext.updateProps.bind(elContext);
    op(
      <>
        <TouchableOpacity
          ifTrue={() => state.refItem.isVisible}
          onPress={() => {
            toggle(false);
          }}
          css="blur flex"
        />
        {render(
          <View
            invertColor={true}
            css="clearboth pa:10 flex">
            <View
              css="he:30 zi:1 fg:1 overflow"
              onTouchStart={() => {
                state.refItem.isTouched = true;
              }}>
              <View
                invertColor={false}
                css="bor:5 zi:1 to:5 wi:40 he:15 juc:center ali:center absolute le:45%">
                <TouchableOpacity
                  onPress={() => {
                    toggle(false);
                  }}
                  css="clearboth flex juc:center ali:center">
                  <Icon
                    css="bold"
                    type="Entypo"
                    name="chevron-small-down"
                    size={14}
                    invertColor={false}
                  />
                </TouchableOpacity>
              </View>
              <Text
                ifTrue={title != undefined}
                invertColor={true}
                css="header fos:18 bold co:white clearwidth flex">
                {title}
              </Text>
            </View>
            <View ifTrue={() => state.refItem.show} css="flex fg:1 zi:5 maw:99% overflow">
              {children}
            </View>
          </View>,
          {
            css: "overflow absolute mah:80% le:1% overflow wi:98% juc:flex-start boTLR:25 botrr:25",
            style: [
              {
                height: getHeight(),
                transform: [
                  {
                    translateY:
                      animate.y.interpolate({
                        inputRange: inputRange,
                        outputRange: state.refItem.interpolate,
                        extrapolate: "clamp"
                      })
                  }
                ]
              },
            ],
            ...state.refItem.panResponse
              .panHandlers
          }
        )}
      </>,
      state.id,
      {
        visible: state.refItem.isVisible,
        toTop
      }
    );
  };

  useEffect(() => {
    renderUpdate();
  });

  return null;
};
