import {View, AnimatedView, Text, TouchableOpacity, ScrollView} from "./ReactNativeComponents";
import Icon from "./Icons";
import * as React from "react";
import { Animated, Easing } from "react-native";
export default ({
  text,
  onPress,
  css,
  children,
  root,
  ...props
}: any) => {
  let Container = onPress
    ? TouchableOpacity
    : View;
  let st = methods.parseThemeStyle(
    [],
    undefined,
    true
  );
  return (
    <View
      {...props}
      css={`bor:1 pa:5 pal:0 mih:50 pat:10 par:2 clearwidth ${
        css ?? ""
      }`}>
      <Container
        onPress={onPress}
        style={{ borderColor: st[0].color }}
        css={`bow:0.1 bor:2 clearwidth juc:center ali:flex-end
      }`}>
        <View
          ifTrue={root != true}
          css={`flex row fg:1 pa:10 juc:space-between ali:center`}>
          {children}
        </View>
        <View
          ifTrue={root == true}
          css={`clearboth flex:0 fg:1 pa:10`}>
          {children}
        </View>
        <View
          ifTrue={text != undefined}
          invertColor={true}
          css="absolute to:-1.5 le:10 pal:10 he:2 overflow:visible">
          <Text
            invertColor={true}
            css={`
              ${props.tcss} mat:-10 form.Text he:20 wi:100%
            `}>
            {text}
          </Text>
        </View>
      </Container>
    </View>
  );
};
