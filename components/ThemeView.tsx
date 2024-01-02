import { View } from "react-native";
import globalData from "../GlobalContext";
import { useState } from "react";

export default ({
  style,
  children,
  invertColor,
  css,
  layoutReady,
  ...props
}: any) => {
  const [ready, setready] = useState(
    layoutReady !== true
  );
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

  return (
    <View
      {...props}
      style={st}
      onLayout={e => {
        if (layoutReady&& e.nativeEvent.layout.height >2) setready(true);
        props?.onLayout?.(e);
      }}>
      {ready ? children : null}
    </View>
  );
};
