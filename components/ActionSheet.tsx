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
  let context = useContext(ElementsContext);
  const [started, setStarted] = useState(false);
  const [isV, setIsV] = useState(false);
  const [animTop, setAnimTop] = useState(
    new Animated.Value(
      -proc(
        parseFloat(
          (height || "0").replace(/%/g, "")
        ),
        g.size.window.height
      )
    )
  );
  const animating = useRef(false);
  let id = useRef(newId());

  let getHeight = () => {
    return proc(
      parseFloat(
        (height || "0").replace(/%/g, "")
      ),
      g.size.window.height
    );
  };

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
              height: height,
              transform: [
                {
                  translateY: animTop.interpolate(
                    {
                      inputRange: [0, 1],
                      outputRange: [
                        g.size.window.height + 50,
                        g.size.window.height -
                          getHeight() +
                          43
                      ]
                    }
                  )
                }
              ]
            },
            "absolute mh:95% overflow clearwidth jc:flex-start borderTopLeftRadius:25 borderTopRightRadius:25".css()
          ]}>
          <View
            invertColor={true}
            css="clearboth pa:10">
            <View css="h:30 zi:1 ">
              <View
                invertColor={false}
                css="br:5 zi:1 t:5 w:40 h:15 jc:center ai:center absolute l:45%">
                <TouchableOpacity
                  onPress={() => {
                    (onHide || setIsV)(false);
                  }}
                  css="clearboth flex jc:center ai:center">
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
                css="header fs:18 bold c:white clearwidth flex">
                {title}
              </Text>
            </View>
            <View css="flex overflow">
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
