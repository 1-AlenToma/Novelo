import {View, AnimatedView, Text, TouchableOpacity, ScrollView} from "./ReactNativeComponents";
import Icon from "./Icons";
import { ElementsContext } from "./AppContainer";
import { proc, sleep, newId } from "../Methods";
import {
  useContext
} from "react";
import * as React from "react";
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
  blur,
  disabled,
  ...props
}: {
  speed?: number;
  children?: any;
  title?: any;
  height: any;
  visible: boolean;
  onHide?: () => void;
  toTop?: boolean;
  blur?: boolean;
  disabled?: boolean;
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
  const animating = useRef();
  let id = useRef(newId());

  let toggle = async (show: boolean) => {
    animating.current?.stop();
    animating.current = Animated.timing(animTop, {
      toValue: !show ? 0 : 1,
      duration: (100).sureValue(speed),
      easing: Easing.linear,
      useNativeDriver: true
    });
    animating.current.start(() => {
      setIsV(visible);
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
            if (blur !== false && !disabled) {
              (onHide || setIsV)(false);
            }
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
                        (context.size.window
                          .height /
                          100) *
                        50 +
                        (-getHeight() / 100) *
                        50
                      ]
                    }
                  )
                }
              ]
            },
            "absolute mah:95% overflow wi:90% juc:flex-start bor:25 le:5%".css()
          ]}>
          <View
            invertColor={true}
            css="clearboth pa:10 flex">
            <View css="he:30 zi:1">
              <View css="zi:1 to:5 wi:40 he:26 juc:center ali:center absolute ri:5">
                <TouchableOpacity
                  onPress={() => {
                    if (!disabled)
                      (onHide || setIsV)(false);
                  }}
                  css="clearboth flex juc:center ali:center">
                  <Icon
                    css="bold co:#e7b61d"
                    type="AntDesign"
                    name="closecircle"
                    size={24}
                  />
                </TouchableOpacity>
              </View>
              <Text
                ifTrue={title != undefined}
                invertColor={true}
                css="header fos:18 bold clearwidth flex">
                {title}
              </Text>
            </View>
            <View css="flex clearboth">
              {children}
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
    //elContext.update();
  });

  return null;
};