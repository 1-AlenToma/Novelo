import { TouchableOpacity } from "react-native";
import {
  removeProps,
  parseThemeStyle
} from "../Methods";

export default ({
  style,
  children,
  invertColor,
  css,
  ...props
}: any) => {
  let st = parseThemeStyle(style, css,invertColor);
  return (
    <TouchableOpacity
      {...props}
      style={st}>
      {children}
    </TouchableOpacity>
  );
};
