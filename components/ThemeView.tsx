import { View } from "react-native";
import { useState } from "react";
import Constants from "expo-constants";
import {
  removeProps,
  parseThemeStyle,
  StyledView
} from "../Methods";
import g from "../GlobalContext";

const VS = StyledView(View, "View");

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
  if (ifTrue === false) return null;
  if (rootView) g.hook("isFullScreen");
  const [state, setState] = useState(
    ready !== true
  );
  const [size, setSize] = useState();
  let st = parseThemeStyle(
    style,
    undefined,
    invertColor
  );
  st.push(size);
  if (rootView && !g.isFullScreen) {
    st.push({
      marginTop: Constants.statusBarHeight
    });
  }

  return (
    <VS
      {...props}
      style={st}
      css={css}
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
    </VS>
  );
};
