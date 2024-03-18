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
import { useUpdate } from "../hooks";
const g = require("../GlobalContext").default;
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
  height: string;
  visible: boolean;
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
        g.size.window.height
      );
    }
    if (h < 400) h = 400;

    return h;
  };

  let context = useContext(ElementsContext);
  const [started, setStarted] = useState(false);
  const isVisible = useRef(false);
  const panResponse = useRef();
  const isTouched = useRef(false);
  const interpolate = useRef([
    g.size.window.height - getHeight() + 80,
    g.size.window.height + 50
  ]);

  const animTop = useRef(
    new Animated.ValueXY({
      y: -getHeight(),
      x: 0
    })
  ).current;
  const animating = useRef();
  let id = useRef(newId());

  const tAnimate = (
    value: number,
    fn: any,
    sp?: number
  ) => {
    animating.current?.stop?.();
    animating.current = Animated.timing(
      animTop.y,
      {
        toValue: value,
        duration: sp ?? speed ?? sp ?? 300,
        easing: Easing.linear,
        useNativeDriver: true
      }
    );
    animating.current.start(() => {
      fn?.();
      animTop.setValue({ y: value, x: 0 });
      animTop.flattenOffset();
    });
  };

  let toggle = async (show: boolean) => {
    if (!isVisible.current && show)
      renderUpdate();
    tAnimate(
      interpolate.current[!show ? 1 : 0],
      () => {
        panResponse.current = undefined;
        if (isVisible.current && !show) {
          onHide(false);
          renderUpdate();
        }
        //renderUpdate();
      }
    );
  };

  g.subscribe(() => {
    interpolate.current = [
      g.size.window.height - getHeight() + 80,
      g.size.window.height + 50
    ];

    if (isVisible.current) {
      renderUpdate();
      panResponse.current = undefined;
      animTop.flattenOffset();
      tAnimate(
        interpolate.current[0],
        () => renderUpdate(),
        1
      );
    }
  }, "size");

  if (typeof visible === "function")
    g.subscribe(() => {
      toggle(visible());
    }, "selection");
  if (typeof visible !== "function")
    useEffect(() => {
      toggle(visible);
    }, [visible]);

  useEffect(() => {
    setStarted(true);
    return () => {
      context.remove(id.current);
      context.update();
    };
  }, []);

  const renderUpdate = () => {
    if (typeof visible !== "function")
      isVisible.current = visible;
    else isVisible.current = visible();
    if (!panResponse.current && animTop) {
      let startValue = 0;
      panResponse.current = PanResponder.create({
        onMoveShouldSetPanResponder: (
          evt,
          gestureState
        ) => {
          const { dx, dy } = gestureState;
          return (
            isTouched.current &&
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
          startValue = gestureState.dy;
          animTop.setValue({
            x: 0,
            y: interpolate.current[0]
          });
          animTop.extractOffset();
          return true;
        },
        onPanResponderMove: Animated.event(
          [
            null,
            { dx: animTop.x, dy: animTop.y }
          ],
          { useNativeDriver: false }
        ),
        onPanResponderRelease: (
          evt,
          gestureState
        ) => {
          let old = interpolate.current[0];
          let newValue = gestureState.dy;
          let diff = newValue - startValue;

          if (Math.abs(diff) > getHeight() / 3) {
            toggle(false);
          } else {
            animTop.flattenOffset();
            tAnimate(old); // reset to start value
          }
          return false;
        }
      });
    }
    let op = !context.has(id.current)
      ? context.push.bind(context)
      : context.updateProps.bind(context);
    op(
      <>
        <TouchableOpacity
          ifTrue={() => isVisible.current}
          onPress={() => {
            toggle(false);
          }}
          css="blur flex"
        />
        <Animated.View
          onTouchEnd={() =>
            (isTouched.current = false)
          }
          style={[
            {
              height: getHeight(),
              transform: [
                {
                  translateY:
                    animTop.y.interpolate({
                      inputRange:
                        interpolate.current,
                      outputRange:
                        interpolate.current,
                      extrapolate: "clamp"
                    })
                }
              ]
            },
            "absolute mah:95% overflow clearwidth juc:flex-start boTLR:25 botrr:25".css()
          ]}
          {...(panResponse.current?.panHandlers ??
            {})}>
          <View
            invertColor={true}
            css="clearboth pa:10 flex">
            <View
              css="he:30 zi:1 fg:1 overflow"
              onTouchStart={() => {
                isTouched.current = true;
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
            <View css="flex fg:1 zi:5 mah:95% maw:99% overflow">
              {children}
            </View>
          </View>
        </Animated.View>
      </>,
      id.current,
      {
        visible: isVisible.current,
        toTop
      }
    );
  };

  useEffect(() => {
    renderUpdate();
  });

  return null;
};
