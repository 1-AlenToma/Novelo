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
  Easing
} from "react-native";
const g = require("../GlobalContext").default;
export default ({
  title,
  height,
  children,
  visible,
  onHide,
  speed,
  ...props
}: {
  speed?: number;
  children?: any;
  title?: any;
  height: string;
  visible: boolean;
  onHide?: () => void;
}) => {
  let getHeight = () => {
    if (
      typeof height === "number" &&
      height > 100
    )
      return height;
    return proc(
      parseFloat(
        (height?.toString() ?? "0").replace(
          /%/g,
          ""
        )
      ),
      g.size.window.height
    );
  };
  let context = useContext(ElementsContext);
  const [started, setStarted] = useState(false);
  const [isV, setIsV] = useState(false);
  const [animTop, setAnimTop] = useState(
    new Animated.Value(-getHeight())
  );
  const animating = useRef(false);
  let id = useRef(newId());

  let toggle = async (show: boolean) => {
    while (animating.current || !animTop) return;
    //await sleep(50);

    animating.current = true;
    Animated.timing(animTop, {
      toValue: !show ? 0 : 1,
      duration: (100).sureValue(speed),
      easing: Easing.linear,
      useNativeDriver: true
    }).start(() => {
      animating.current = false;
      setIsV(visible);
      context.update();
      //setIsV(visible);
    });
  };

  g.subscribe(
    () => {
      //setAnimTop(new Animated.Value(-vHeight));
      toggle(isV);
    },
    "size",
    "theme.themeMode"
  );

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
                        (g.size.window.height /
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
                css="header fos:18 bold co:white clearwidth flex">
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
        visible: isV
      }
    );
    context.update();
  }, [
    props,
    title,
    children,
    isV,
    animating.current
  ]);

  return null;
};
