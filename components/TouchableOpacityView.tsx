import { TouchableOpacity } from "react-native";
import {
  removeProps,
  parseThemeStyle,
  StyledView,
  ifSelector
} from "../Methods";

const Btn = StyledView(
  TouchableOpacity,
  "TouchableOpacity"
);

export default ({
  style,
  children,
  invertColor,
  css,
  ifTrue,
  ...props
}: any) => {
  if (ifSelector(ifTrue) === false) return null;
  let st = parseThemeStyle(
    style,
    css,
    invertColor
  );
  return (
    <Btn
      {...props}
      style={st}
      css={css}>
      {children}
    </Btn>
  );
};
