import View from "./ThemeView";
import Text from "./ThemeText";
import Icon from "./Icons";
import TouchableOpacity from "./TouchableOpacityView";
import { ElementsContext } from "./AppContainer";
import { proc, sleep, newId } from "../Methods";
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
}) => {
  let getHeight = () => {
    let h = height;
    if (!(typeof h === "number" && h > 100)) {
      h = proc(
        parseFloat(
          (h?.toString() ?? "0").replace(/%/g, "")
        ),
        context.size.window.height
      );
    }
    if (h < 400) h = 400;

    return h;
  };

  let elContext = useContext(ElementsContext);
  const { animateY, animate } = useAnimate({
    y: -getHeight(),
    speed
  });
  const [render, state, loader] = useView({
    component: Animated.View,
    onTouchEnd: () =>
      (state.refItem.isTouched = false),
    state: {
      started: false,
      refItem: {
        startValue: 0,
        isVisible: false,
        panResponse: undefined,
        isTouched: false,
        interpolate: [
          context.size.window.height -
            getHeight() +
            80,
          context.size.window.height + 50
        ]
      }
    }
  });

  const setSize = () => {
    state.refItem.interpolate = [
      context.size.screen.height -
        getHeight() +
        50,
      context.size.window.height + 50
    ];
  };
  setSize();

  let toggle = async (show: boolean) => {
    if (!state.refItem.isVisible && show)
      renderUpdate();
    animateY(
      state.refItem.interpolate[!show ? 1 : 0],
      () => {
        state.refItem.panResponse = undefined;
        if (state.refItem.isVisible && !show) {
          onHide(false);
          renderUpdate();
        }
        //renderUpdate();
      }
    );
  };

  context.subscribe(() => {
    setSize();
    if (state.refItem.isVisible) {
      renderUpdate();
      state.refItem.panResponse = undefined;
      animate.flattenOffset();
      animateY(
        state.refItem.interpolate[0],
        () => renderUpdate(),
        1
      );
    }
  }, "size");

  if (typeof visible === "function")
    context.subscribe(() => {
      toggle(visible());
    }, "selection");
  if (typeof visible !== "function")
    useEffect(() => {
      toggle(visible);
    }, [visible]);

  useEffect(() => {
    state.started = true;
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
            <View css="flex fg:1 zi:5 maw:99% overflow">
              {children}
            </View>
          </View>,
          {
            style: [
              {
                height: getHeight(),
                transform: [
                  {
                    translateY:
                      animate.y.interpolate({
                        inputRange:
                          state.refItem
                            .interpolate,
                        outputRange:
                          state.refItem
                            .interpolate,
                        extrapolate: "clamp"
                      })
                  }
                ]
              },
              "absolute mah:95% le:1% overflow wi:98% juc:flex-start boTLR:25 botrr:25".css()
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
