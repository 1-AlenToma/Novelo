import { Text } from "react-native";
import {
  removeProps,
  parseThemeStyle,
  StyledView,
  ifSelector
} from "../Methods";
const Txt = StyledView(Text, "Text");
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
    <Txt
      {...props}
      css={css}
      style={removeProps(st, "backgroundColor")}>
      {children}
    </Txt>
  );
};
