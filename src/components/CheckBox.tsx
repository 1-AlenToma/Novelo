import View from "./ThemeView";
import Text from "./ThemeText";
import Icon from "./Icons";
import * as React from "react";
import { Animated, Easing } from "react-native";
import TouchableOpacity from "./TouchableOpacityView";
import AnimatedView from "./AnimatedView";
import { useAnimate } from "../hooks";
export default ({
  checked,
  text,
  onChange,
  css,
  ifTrue,
  children,
  ...props
}: any) => {
  if (methods.ifSelector(ifTrue) === false)
    return null;
  const { animateX, animate, currentValue } =
    useAnimate({ speed: 100 });
  const [isChecked, setIsChecked] =
    useState(checked);
  const prev = useRef(checked);


  const loaded = useRef();
  const tAnimate = (value: number, fn: any) => {
    //if (currentValue.x == value) return;
    let ch = value == 1 ? true : false;
    //setIsChecked(ch);

    animateX(
      value,
      () => {
        if (
          prev.current !== isChecked &&
          onChange && loaded.current
        ) {
          onChange(isChecked);
        }
        prev.current = isChecked;
        fn?.();
        loaded.current = true;
      },
      !loaded.current ? 1 : undefined
    );
  };

  useEffect(() => {
    setIsChecked(checked);
  }, [checked])

  useEffect(() => {
    tAnimate(isChecked ? 1 : 0);

  }, [isChecked]);

  let Container = onChange
    ? TouchableOpacity
    : View;
  return (
    <View
      css={`bor:1 pa:5 pal:10 par:2 clearwidth ${css ?? ""
        }`}>
      <Container
        onPress={() => {
          setIsChecked(!isChecked);
        }}
        css={`row form clearwidth juc:space-between ali:center
      }`}>
        <Text
          ifTrue={text != undefined}
          {...props}
          style={{
            flexGrow: 1,
            maxWidth: "80%",
            overflow: "hidden"
          }}>
          {text}
        </Text>
        <View css="bac:#00000083 bor:10 juc:center wi:60 he:30 overflow he:30">
          <AnimatedView
            style={{
              transform: [
                {
                  translateX:
                    animate.x.interpolate({
                      inputRange: [0, 1],
                      outputRange: [5, 28],
                      extrapolate: "clamp"
                    })
                }
              ]
            }}
            {...props}
            invertColor={true}
            css="wi:25 he:25 bor:20">
            <Icon
              name="check"
              type="Entypo"
              size={24}
              color={isChecked ? "green" : "gray"}
            />
          </AnimatedView>
        </View>
      </Container>
      {children}
    </View>
  );
};
