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
  g.hook("size", "selection");
  let context = useContext(ElementsContext);
  const [started, setStarted] = useState(false);
  const [isV, setIsV] = useState(false);
  const [onReady, setOnReady] = useState(!ready);
  const [animTop, setAnimTop] = useState(
    new Animated.Value(-getHeight())
  );
  const animating = useRef(false);
  let id = useRef(newId());

  let toggle = async (show: boolean) => {
    while (animating.current || !animTop) return;
    //await sleep(50);
    if (show && ready) setOnReady(false);
    animating.current = true;
    Animated.timing(animTop, {
      toValue: !show ? 0 : 1,
      duration: (100).sureValue(speed),
      easing: Easing.linear,
      useNativeDriver: true
    }).start(() => {
      animating.current = false;
      if (typeof visible !== "function")
        setIsV(visible);
      else setIsV(visible());
      context.update();
      if (show) setOnReady(true);

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
                        g.size.window.height + 50,
                        g.size.window.height -
                          getHeight() +
                          80
                      ]
                    }
                  )
                }
              ]
            },
            "absolute mah:95% overflow clearwidth juc:flex-start boTLR:25 botrr:25".css()
          ]}>
          <View
            invertColor={true}
            css="clearboth pa:10 flex">
            <View css="he:30 zi:1">
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
            <View css="flex zi:5:">
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
