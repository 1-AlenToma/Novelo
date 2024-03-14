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
  text,
  onPress,
  css,
  children,
  ...props
}) => {
  let Container = onPress
    ? TouchableOpacity
    : View;
  return (
    <View
      {...props}
      css={`bor:1 pa:5 pal:0 par:2 clearwidth ${
        css ?? ""
      }`}>
      <Container
        onPress={onPress}
        css={`row form clearwidth juc:space-between ali:center
      }`}>
        <Text
          ifTrue={text != undefined}
          invertColor={true}
          css={props.tcss}>
          {text}
        </Text>
        <View css="flex fg:1 row juc:space-between ali:center">
          {children}
        </View>
      </Container>
    </View>
  );
};
