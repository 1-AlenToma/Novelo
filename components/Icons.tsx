import * as Icons from "@expo/vector-icons";
import {
  removeProps,
  parseThemeStyle,
  StyledView
} from "../Methods";
let styledItems = {};
export default ({
  name,
  type,
  size,
  style,
  css,
  invertColor,
  ...props
}: any) => {
  if (type && !styledItems[type])
    styledItems[type] = StyledView(
      Icons[type],
      "Icon"
    );
  let ICO = styledItems[type];
  let st = parseThemeStyle(
    style,
    css,
    invertColor
  );
  return (
    <ICO
      {...props}
      style={removeProps(st, "backgroundColor", props.color? "color": "")}
      color={props.color}
      size={parseInt((24).sureValue(size))}
      css={css}
      name={name}
    />
  );
};
