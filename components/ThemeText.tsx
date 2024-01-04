import { Text } from "react-native";
import {
  removeProps,
  parseThemeStyle
} from "../Methods";

export default ({
  style,
  children,
  invertColor,
  css,
  ifTrue,
  ...props
}: any) => {
  if(ifTrue === null || ifTrue === false)
    return null;
  let st =
    parseThemeStyle(style, css, invertColor)
  
  return (
    <Text
      {...props}
      style={removeProps(st, "backgroundColor")}>
      {children}
    </Text>
  );
};
