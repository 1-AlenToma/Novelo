import View from "./ThemeView";
import Text from "./ThemeText";
import Icon from "./Icons";
import {
  useState,
  useEffect,
  useRef
} from "react";
import { Animated, Easing } from "react-native";
import TouchableOpacity from "./TouchableOpacityView";
import AnimatedView from "./AnimatedView";
export default ({
  checked,
  text,
  onChange,
  css,
  children,
  ...props
}) => {
  const [isChecked, setIsChecked] =
    useState(checked);
  const animLeft = useRef(
    new Animated.ValueXY()
  ).current;
  const tAnimate = (value: number) => {
    Animated.timing(animLeft.x, {
      toValue: value,
      duration: (100).sureValue(100),
      easing: Easing.linear,
      useNativeDriver: true
    }).start(() => {});
  };
  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  useEffect(() => {
    tAnimate(isChecked ? 1 : 0);
    if (isChecked !== checked && onChange)
      onChange(isChecked);
  }, [isChecked]);
  let Container = onChange
    ? TouchableOpacity
    : View;
  return (
    <View
      css={`bor:1 pa:5 pal:10 par:2 clearwidth ${
        css ?? ""
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
                    animLeft.x.interpolate({
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
