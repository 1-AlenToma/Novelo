import { Animated } from "react-native";
import {
  useState,
  useEffect,
  useRef
} from "react";
import gdata from "../GlobalContext";
import { sleep } from "../Methods";
import View from "./ThemeView";

export default ({
  children,
  style,
  refItem,
  speed,
  status,
  css,
  ifTrue
}: any) => {
  const [size, setSize] = useState({});
  const [animWidth, setAnimWidth] = useState();
  const [animHeight, setAnimHeight] = useState();
  const [isTrue, setIsTrue] = useState(ifTrue);
  const [state, setState] = useState(false);
  const [isAnimate, setIsAnimate] =
    useState(false);
  let animated = useRef(false);
  let init = useRef(false);

  let toggle = async (
    show: boolean,
    force: boolean
  ) => {
    while (isAnimate) await sleep(50);
    if (show === animated.current && !force)
      return;
    animated.current = show;
    setState(show);
    init.current = true;

    if (
      typeof refItem.width === "number" &&
      animWidth
    ) {
      await setIsAnimate(true);
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
      await setIsAnimate(true);
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
    refItem.state = state;
  gdata.subscribe(() => {
    setAnimWidth(null);
    setAnimHeight(null);
  }, "size");

  useEffect(() => {
    // if (!animated.current && !isAnimate)
    //  setIsTrue(ifTrue);
    toggle(animated.current).then(x =>
      setIsTrue(ifTrue)
    );
  }, [ifTrue]);

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
  let render =
    isTrue == undefined || isTrue || isAnimate;
  return (
    <>
      <Animated.View
        style={[
          { backgroundColor: "transparent" },
          ...st,
          {
            zIndex: 101,
            ...(typeof refItem.height ===
              "number" &&
            animHeight &&
            render
              ? { height: animHeight }
              : {}),
            ...(typeof refItem.width ===
              "number" &&
            animWidth &&
            render
              ? { width: animWidth }
              : {})
          }
        ]}
        onLayout={event => {
          const { x, y, width, height } =
            event.nativeEvent.layout;
          if (!animHeight || !init.current) {
            setAnimWidth(
              new Animated.Value(width)
            );
            setAnimHeight(
              new Animated.Value(height)
            );
            setSize(event.nativeEvent.layout);
          }
        }}>
        {render ? children : null}
      </Animated.View>
    </>
  );
};
