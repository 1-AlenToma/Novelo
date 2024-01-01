import { View } from "react-native";
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

  delete themeSettings.backgroundColor;
  let st =
    style && Array.isArray(style)
      ? [...style]
      : [style || {}];
  st = [themeSettings, ...st];
  if (css) st.push(css.css());

  return <View style={st}>{children}</View>;
};
