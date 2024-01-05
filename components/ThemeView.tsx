import { View } from "react-native";
import { useState } from "react";
import Constants from "expo-constants";
import {
  removeProps,
  parseThemeStyle
} from "../Methods";
import g from "../GlobalContext";

export default ({
  style,
  children,
  invertColor,
  css,
  ready,
  rootView,
  ifTrue,
  ...props
}: any) => {
   if( ifTrue === false)
     return null;
  if(rootView)
    g.hook("isFullScreen")
  const [state, setState] = useState(
    ready !== true
  );
  const [size, setSize] = useState();
  let st = parseThemeStyle(
    style,
    css,
    invertColor
  );
  st.push(size);
  if (rootView && !g.isFullScreen) {
    st.push({
      marginTop: Constants.statusBarHeight
    });
  }

  return (
    <View
      {...props}
      style={st}
      onLayout={e => {
        if (
          ready &&
          e.nativeEvent.layout.height > 2
        ) {
          setState(true);
          setSize(e.nativeEvent.layout);
        }
        props?.onLayout?.(e);
      }}>
      {state ? children : null}
    </View>
  );
};
