import { View } from "react-native";
import { useState } from "react";
import Constants from "expo-constants";
import { StyledView } from "../Methods";

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
  if (methods.ifSelector(ifTrue) === false)
    return null;
  let keys = ["theme.settings"];
  if (rootView) keys.push("isFullScreen");
  context.hook(...keys);
  const [state, setState] = useState(
    ready !== true
  );
  const [size, setSize] = useState();
  let st = methods.parseThemeStyle(
    style,
    undefined,
    invertColor,
    rootView
  );

  if (rootView && !context.isFullScreen) {
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
