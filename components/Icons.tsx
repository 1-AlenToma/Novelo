import * as Icons from "@expo/vector-icons";
import {
  removeProps,
  parseThemeStyle,
  StyledView,
  ifSelector
} from "../Methods";
import { useTimer } from "../hooks";
import { useState } from "react";
let styledItems = {};
export default ({
  name,
  type,
  size,
  style,
  css,
  invertColor,
  ifTrue,
  flash,
  ...props
}: any) => {
  if (ifSelector(ifTrue) === false) return null;
  const [color, setColor] = useState(props.color);
  const time = useTimer(1000);
  if (flash)
    time(() =>
      setColor(
        color == flash ? props.color : flash
      )
    );
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
      style={removeProps(
        st,
        "backgroundColor",
        color ? "color" : ""
      )}
      color={color}
      size={parseInt((24).sureValue(size))}
      css={css}
      name={name}
    />
  );
};
