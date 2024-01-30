import * as Icons from "@expo/vector-icons";
import {
  removeProps,
  parseThemeStyle
} from "../Methods";

export default ({
  name,
  type,
  size,
  style,
  css,
  invertColor,
  ...props
}: any) => {
  let ICO = Icons[type];
  let st = parseThemeStyle(
    style,
    css,
    invertColor
  );
  return (
    <ICO
      {...props}
      style={removeProps(st, "backgroundColor")}
      color={props.color}
      size={parseInt((24).sureValue(size))}
      name={name}
    />
  );
};
