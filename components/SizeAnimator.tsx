import { Animated } from "react-native";
import {
  useState,
  useEffect,
  useRef
} from "react";
import gdata from "../GlobalContext";

export default ({
  children,
  style,
  refItem,
  speed,
  status,
  css
}: any) => {
  const [size, setSize] = useState({});
  const [animWidth, setAnimWidth] = useState();
  const [animHeight, setAnimHeight] = useState();
  const [isAnimate, setIsAnimate] =
    useState(false);
  let animated = useRef(false);
  let init = useRef(false);

  let toggle = async show => {
    if (show === animated.current) return;
    animated.current = show;
    init.current = true;

    if (
      typeof refItem.width === "number" &&
      animWidth
    ) {
      //wait setIsAnimate(true);
      Animated.timing(animWidth, {
        toValue: !show
          ? size.width
          : refItem.width,
        duration: speed || 500,
        useNativeDriver: false
      }).start(() => setIsAnimate(false));
    }

    if (
      typeof refItem.height === "number" &&
      animHeight
    ) {
      //await setIsAnimate(true);
      Animated.timing(animHeight, {
        toValue: !show
          ? size.height
          : refItem.height,
        duration: speed || 500,
        useNativeDriver: false
      }).start(() => setIsAnimate(false));
    }
  };

  refItem.show = () => toggle(true);
  refItem.hide = () => toggle(false);
  gdata.subscribe(() => {
    setAnimWidth(null);
    setAnimHeight(null);
  }, "size");

  if (
    status == false &&
    !isAnimate &&
    size.height !== undefined
  )
    return null;
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
          ...(typeof refItem.height ===
            "number" && animHeight
            ? { height: animHeight }
            : {}),
          ...(typeof refItem.width === "number" &&
          animWidth
            ? { width: animWidth }
            : {})
        }
      ]}
      onLayout={event => {
        const { x, y, width, height } =
          event.nativeEvent.layout;
        if (!animHeight || !init.current) {
          setAnimWidth(new Animated.Value(width));
          setAnimHeight(
            new Animated.Value(height)
          );
          setSize(event.nativeEvent.layout);
        }
      }}>
      {children}
    </Animated.View>
  );
};
