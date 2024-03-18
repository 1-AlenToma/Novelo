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
  g.hook("size", "selection");
  let context = useContext(ElementsContext);
  const [started, setStarted] = useState(false);
  const [isV, setIsV] = useState(false);
  const panResponse = useRef();
  const isTouched = useRef(false);
  const [onReady, setOnReady] = useState(!ready);
  const updater = useUpdate();
  const [interpolate, setInterpolate] = useState([
    g.size.window.height - getHeight() + 80,
    g.size.window.height + 50
  ]);

  const animTop = useRef(
    new Animated.ValueXY({
      y: -getHeight(),
      x: 0
    })
  ).current;
  const animating = useRef(false);
  let id = useRef(newId());

  const tAnimate = (
    value: number,
    fn: any,
    sp?: number
  ) => {
    Animated.timing(animTop.y, {
      toValue: value,
      duration: (100).sureValue(
        sp == undefined ? speed : sp
      ),
      easing: Easing.linear,
      useNativeDriver: true
    }).start(() => {
      fn?.();
      animTop.setValue({ y: value, x: 0 });
      animTop.flattenOffset();
    });
  };

  let toggle = async (show: boolean) => {
    while (animating.current || !animTop) return;
    //await sleep(50);
    if (show && ready) setOnReady(false);
    animating.current = true;
    // animTop.flattenOffset();
    tAnimate(interpolate[!show ? 1 : 0], () => {
      animating.current = false;
      if (typeof visible !== "function")
        setIsV(visible);
      else setIsV(visible());

      if (show) setOnReady(true);
      panResponse.current = undefined;
      updater();
      //if (!show) animTop.flattenOffset();

      //setIsV(visible);
    });
  };

  g.subscribe(() => {
    setInterpolate([
      g.size.window.height - getHeight() + 80,
      g.size.window.height + 50
    ]);
  }, "size");
  useEffect(() => {
    if (isV) {
      panResponse.current = undefined;
      animTop.flattenOffset();
      tAnimate(
        interpolate[0],
        () => updater(),
        1
      );
    }
  }, [interpolate]);
  if (typeof visible === "function")
    g.subscribe(() => {
      if (!isV) setIsV(visible());
      toggle(visible());
    }, "selection");
  if (typeof visible !== "function")
    useEffect(() => {
      if (!isV) setIsV(visible);
      toggle(visible);
    }, [visible]);

  useEffect(() => {
    setStarted(true);
    return () => {
      context.remove(id.current);
      context.update();
    };
  }, []);

  useEffect(() => {
    if (!panResponse.current && animTop) {
      // animTop.extractOffset();
      let startValue = 0;
      panResponse.current = PanResponder.create({
        onMoveShouldSetPanResponder: (
          evt,
          gestureState
        ) => {
          //return true if user is swiping, return false if it's a single click
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
            y: interpolate[0]
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
          let old = interpolate[0];
          let newValue = gestureState.dy;
          let diff = newValue - startValue;

          if (Math.abs(diff) > getHeight() / 3) {
            onHide(!visible);
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
          ifTrue={isV}
          onPress={() => {
            (onHide || setIsV)(false);
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
                      inputRange: interpolate,
                      outputRange: interpolate,
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
              css="he:30 zi:1"
              onTouchStart={() => {
                isTouched.current = true;
              }}>
              <View
                invertColor={false}
                css="bor:5 zi:1 to:5 wi:40 he:15 juc:center ali:center absolute le:45%">
                <TouchableOpacity
                  onPress={() => {
                    (onHide || setIsV)(false);
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
            <View css="flex fg:1 zi:5 maw:99%">
              {onReady ? children : null}
            </View>
          </View>
        </Animated.View>
      </>,
      id.current,
      {
        visible: isV,
        toTop
      }
    );
  });

  return null;
};
