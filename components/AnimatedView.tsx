import { View, Animated } from "react-native";
import { useState } from "react";
import Constants from "expo-constants";
import {
  removeProps,
  parseThemeStyle,
  StyledView,
  ifSelector
} from "../Methods";


const VS = StyledView(Animated.View, "AnimatedView");

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
  if (rootView) context.hook("isFullScreen");
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
  if (rootView && !context.isFullScreen) {
    st.push({
      marginTop: Constants.statusBarHeight
    });
  }

  return (
    <VS
      {...props}
      style={st}
      css={css}>
      {state ? children : null}
    </VS>
  );
};
