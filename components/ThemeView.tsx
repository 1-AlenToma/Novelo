import { View } from "react-native";
import { useState } from "react";
import Constants from "expo-constants";
import {
  removeProps,
  parseThemeStyle,
  StyledView,
  ifSelector
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
  if (ifSelector(ifTrue) === false) return null;
  let keys = ["theme.settings"];
  if (rootView)
    keys.push("isFullScreen");
  //if (ready) keys.push("size");
  if (keys.has()) g.hook(...keys);
  const [state, setState] = useState(
    ready !== true
  );
  const [size, setSize] = useState();
  let st = parseThemeStyle(
    style,
    undefined,
    invertColor
  );

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
