import { Text } from "react-native";
import { removeProps } from "../Methods";
import globalData from "../GlobalContext";

export default ({
  style,
  children,
  invertColor,
  css
}: any) => {
  let themeSettings = {
    ...(!invertColor
      ? globalData.theme.settings
      : globalData.theme.invertSettings())
  };

  let st =
    style && Array.isArray(style)
      ? [...style]
      : [style || {}];
  st = [themeSettings, ...st];
  if (css) {
    st.push(css.css());
  }

  return (
    <Text
      style={removeProps(st, "backgroundColor")}>
      {children}
    </Text>
  );
};
