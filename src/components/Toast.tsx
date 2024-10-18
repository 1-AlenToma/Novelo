import {View, AnimatedView, Text, TouchableOpacity, ScrollView} from "./ReactNativeComponents";
import { ElementsContext } from "./AppContainer";
import { proc, sleep, newId } from "../Methods";
import {
  useContext,
} from "react";
import * as React from "react";
import { useTimer } from "../hooks";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Easing
} from "react-native";

export default ({
  title,
  height,
  children,
  visible,
  onHide,
  speed,
  toTop,
  ...props
}: {
  speed?: number;
  children?: any;
  title?: any;
  height: any;
  visible: boolean;
  onHide?: () => void;
  toTop?: boolean;
}) => {
  let getHeight = () => {
    if (typeof height === "number") return height;
    return proc(
      parseFloat(
        (height?.toString() ?? "0").replace(
          /%/g,
          ""
        )
      ),
      context.size.window.height
    );
  };
  let elContext = useContext(ElementsContext);
  const [isV, setIsV] = useState(false);
  const [animTop, setAnimTop] = useState(
    new Animated.Value(-getHeight())
  );
  const timer = useTimer(5000);
  const animating = useRef();
  let id = useRef(newId());

  let toggle = async (show: boolean) => {
    animating.current?.stop();
    animating.current = Animated.timing(animTop, {
      toValue: !show ? 0 : 1,
      duration: (500).sureValue(speed),
      easing: Easing.linear,
      useNativeDriver: true
    });
    animating.current.start(() => {
      if (isV && !show) {
        onHide?.();
        setIsV(false);
      } else setIsV(visible);
      elContext.update();
    });
  };

  context.useEffect(
    () => {
      toggle(isV);
    },
    "size",
    "theme.themeMode"
  );

  useEffect(() => {
    if (!isV) setIsV(visible);
    toggle(visible);
  }, [visible, height]);

  useEffect(() => {
    if (isV) timer(() => toggle(false));
  }, [isV]);

  useEffect(() => {
    return () => {
      elContext.remove(id.current);
      elContext.update();
    };
  }, []);

  useEffect(() => {
    let op = !elContext.has(id.current)
      ? elContext.push.bind(elContext)
      : elContext.updateProps.bind(elContext);
    op(
      <>
        <TouchableOpacity
          ifTrue={() => isV}
          onPress={() => {
            toggle(false);
          }}
          css="blur flex"
        />
        <Animated.View
          style={[
            {
              height: getHeight(),
              transform: [
                {
                  translateY: animTop.interpolate(
                    {
                      inputRange: [0, 1],
                      outputRange: [
                        -getHeight(),
                        40
                      ]
                    }
                  )
                }
              ]
            },
            "absolute mah:95% overflow wi:90% juc:flex-start bor:2 le:5%".css()
          ]}>
          <TouchableOpacity
            onPress={() => toggle(false)}
            invertColor={true}
            css="flex pal:10 pat:5">
            <Text
              ifTrue={title != undefined}
              invertColor={true}
              css="header fos:18 clearwidth">
              {title}
            </Text>
            {children}
          </TouchableOpacity>
        </Animated.View>
      </>,
      id.current,
      {
        visible: isV,
        toTop
      }
    );
    elContext.update();
  });

  return null;
};
