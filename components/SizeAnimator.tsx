import { Animated } from "react-native";
import {
  useState,
  useEffect,
  useRef
} from "react";
import gdata from "../GlobalContext";
import { sleep } from "../Methods";
import View from "./ThemeView";
import { useAnimate } from "../hooks";

export default ({
  children,
  style,
  refItem,
  speed,
  status,
  css,
  ifTrue
}: any) => {
  if (methods.ifSelector(ifTrue) === false)
    return null;

  const { animateY, animate } = useAnimate({
    speed
  });

  const [state, setState] = useState(false);

  let toggle = async (
    show: boolean,
    force: boolean
  ) => {
    setState(show)
    animateY(!show ? 0 : 1, () => setState(show));
  };

  refItem.show = () => toggle(true);
  refItem.hide = () => toggle(false);
  refItem.state = state;
  gdata.subscribe(() => {
    toggle(state);
    //setAnimHeight(null);
  }, "size");

  if (status == false) return null;
  let st =
    style && Array.isArray(style)
      ? [...style]
      : [style || {}];
  if (css) {
    st.push(css.css());
  }

  return (
    <Animated.View
      style={[
        { backgroundColor: "transparent" },
        ...st,
        {
          zIndex: 101,
          transform: [
            {
              scaleX:
                animate.y?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.6],
                  extrapolate: "clamp"
                }) ?? 1
            }
          ]
        }
      ]}>
      {children}
    </Animated.View>
  );
};
