import {
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  PanResponder
} from "react-native";

import View from "./ThemeView";
import * as Icons from "@expo/vector-icons";
import {
  useState,
  useEffect,
  ReactNode,
  useRef
} from "react";
import {
  sleep,
  newId,
  removeProps,
  proc,
  ifSelector
} from "../Methods";
import GlobalData from "../GlobalContext";
import { useUpdate, useTimer } from "../hooks";
import Text from "./ThemeText";
import { TabIcon, TabChild } from "../Types";
const TabBar = ({
  children,
  selectedIndex,
  style,
  position,
  disableScrolling,
  change,
  rootView,
  scrollHeight,
  fontSize,
  scrollableHeader
}: {
  children: TabChild[];
  style?: any;
  selectedIndex?: number;
  position?: "Bottom" | "Top";
  disableScrolling: boolean;
  change?: (index) => void;
  rootView?: boolean;
  scrollableHeader?: boolean;
}) => {
  const [size, setSize] = useState(undefined);

  const getWidth = (index: number) => {
    let v = index * size?.width;
    if (isNaN(v)) return 0;
    return v;
  };

  const getInputRange = () => {
    let item = children
      .map((x, i) => {
        return {
          index: i,
          value: i == 0 ? 0 : -getWidth(i)
        };
      })
      .sort((a, b) => a.value - b.value);

    return item;
  };
  const startValue = useRef();
  const [interpolate, setInterpolate] = useState(
    getInputRange()
  );

  const [rItems, setrItems] = useState(
    children.map(x => {})
  );
  const panResponse = useRef();
  const animLeft = useRef(
    new Animated.ValueXY({ x: 0, y: 0 })
  ).current;
  const [index, setIndex] = useState(
    (0).sureValue(selectedIndex)
  );

  const isAnimating = useRef(false);

  useEffect(() => {
    tAnimate(index, 0);
  }, [interpolate]);

  useEffect(
    () => {
      children.forEach((x, i) => {
        if (rItems[i]) {
          rItems[i].child = childPrep(x);
        }
      });
      loadChildren(index);
    },
    children.map(x => x)
  );

  useEffect(() => {
    loadChildren(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    if (index !== undefined) change?.(index);
  }, [index]);

  const tAnimate = (
    index: number,
    speed?: number,
    fn: any
  ) => {
    let value =
      interpolate.find(x => x.index == index)
        ?.value ?? 0;
    Animated.timing(animLeft.x, {
      toValue: value,
      duration: (300).sureValue(speed, true),
      useNativeDriver: true
    }).start(() => {
      animLeft.setValue({
        y: 0,
        x: value
      });
      animLeft.flattenOffset();

      fn?.();
    });
  };

  const animateLeft = async (index: number) => {
    //while (isAnimating.current) await sleep(100);
    if (!size) return;
    isAnimating.current = true;
    tAnimate(index, undefined, () => {
      isAnimating.current = false;
    });
  };

  let loadChildren = (i: number) => {
    if (!rItems[i] && children[i]) {
      rItems[i] = {
        child: childPrep(children[i])
      };
    }
    if (
      i >= 0 &&
      i < children.length &&
      !isAnimating.current
    ) {
      setIndex(i);
      animateLeft(i);
    }
  };

  useEffect(() => {
    setInterpolate(getInputRange());
  }, [children, size]);

  const childPrep = child => {
    if (child) {
      if (!child.props.style) return child;
      if (Array.isArray(child.props.style))
        child.props.style.push({ flex: 1 });
      else child.props.style.flex = 1;
    }
    return child;
  };

  const getIcon = (
    icon?: TabIcon,
    iconSize,
    style
  ) => {
    if (!icon) return null;
    let Type = Icons[icon.type];
    if (Type)
      return (
        <Type
          name={icon.name}
          size={(15).sureValue(iconSize)}
          style={removeProps(
            style,
            "backgroundColor"
          )}
        />
      );
  };

  // animTop.extractOffset();

  panResponse.current = PanResponder.create({
    onMoveShouldSetPanResponder: (
      evt,
      gestureState
    ) => {
      //return true if user is swiping, return false if it's a single click
      const { dx, dy } = gestureState;
      let lng = 5;
      return (
        !isAnimating.current &&
        (dx > lng ||
          dx < -lng ||
          dy > lng ||
          dy < -lng)
      );
    },
    onPanResponderGrant: (e, gestureState) => {
      startValue.current = gestureState.dx;
      //alert(interpolate.outputRange[index]);
      animLeft.setValue({
        x:
          interpolate.find(
            x => x.index == (index ?? 0)
          )?.value ?? 0,
        y: 0
      });
      animLeft.extractOffset();
      return true;
    },
    onPanResponderMove: Animated.event(
      [null, { dx: animLeft.x, dy: animLeft.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (
      evt,
      gestureState
    ) => {
      let newValue = gestureState.dx;
      let diff = newValue - startValue.current;
      let width = size?.width ?? 0;
      let i = index == undefined ? 0 : index;
      //console.warn(diff, i);
      animLeft.flattenOffset();
      let speed = 200;
      if (Math.abs(diff) > width / 3) {
        //  animLeft.flattenOffset();
        // alert("animating" + index + 1);
        //console.warn(diff, i);
        if (diff < 0) {
          if (i + 1 < children.length)
            loadChildren(i + 1);
          else tAnimate(i, speed);
        } else {
          if (i - 1 >= 0) loadChildren(i - 1);
          else tAnimate(i, speed);
        }
        //  onHide(!visible);
      } else {
        tAnimate(i, speed); // reset to start value
      }
      return false;
    }
  });

  let MContainer = View;
  let prop = {
    style: [
      styles.menu,
      GlobalData.theme.invertSettings()
    ]
  };
  if (scrollableHeader) {
    MContainer = ScrollView;
    prop = {
      contentContainerStyle: prop.style,
      style: { height: 40 },
      horizontal: true
    };
  }
  let menuItems = children.filter(
    x => ifSelector(x.props.ifTrue) !== false
  );
  let menu =
    menuItems.length > 1 ? (
      <MContainer {...prop}>
        {menuItems.map((x, i) => (
          <TouchableOpacity
            style={[
              styles.menuBtn,
              i == (0).sureValue(index)
                ? GlobalData.theme.settings
                : undefined
            ]}
            key={i + "txt"}
            onPress={() => loadChildren(i)}>
            {getIcon(
              x.props.icon,
              i == (0).sureValue(index) ? 15 : 18,
              [
                styles.menuText,
                GlobalData.theme.invertSettings(),
                i == (0).sureValue(index)
                  ? GlobalData.theme.settings
                  : undefined
              ]
            )}
            {!(x.props.title || "").empty() ? (
              <Text
                invertColor={true}
                style={[
                  styles.menuText,
                  { fontSize },
                  i == (0).sureValue(index)
                    ? GlobalData.theme.settings
                    : undefined
                ]}>
                {x.props.title}
              </Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </MContainer>
    ) : null;

  return (
    <View
      rootView={rootView}
      style={[
        style,
        {
          flex: 1,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          backgroundColor: "inherit"
        }
      ]}
      onLayout={event => {
        setSize(event.nativeEvent.layout);
      }}>
      {position === "Top" ? menu : null}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              {
                translateX:
                  animLeft.x.interpolate({
                    inputRange: interpolate.map(
                      x => x.value
                    ),
                    outputRange: interpolate.map(
                      x => x.value
                    ),
                    extrapolateLeft: "extend",
                    extrapolate: "clamp"
                  })
              }
            ],
            height: (0).sureValue(
              size?.height -
                (menu ? styles.menu.height : 0)
            ),
            width:
              (size?.width ?? 0) * children.length
          }
        ]}
        {...(panResponse.current?.panHandlers ??
          {})}>
        {children.map((x, i) => (
          <View
            css="flex fg:1"
            key={i}>
            {x.props.head}
            {!disableScrolling &&
            !x.props.disableScrolling ? (
              <ScrollView
                style={{
                  width: size?.width,
                  maxHeight: scrollHeight
                }}
                contentContainerStyle={{
                  flexGrow: 1,
                  padding: 5,
                  width: size?.width,
                  maxWidth: "100%"
                }}>
                {rItems[i]?.child ?? null}
              </ScrollView>
            ) : (
              rItems[i]?.child
            )}
          </View>
        ))}
      </Animated.View>
      {position !== "Top" ? menu : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "95%",
    flexDirection: "row",
    display: "flex",
    position: "relative",
    backgroundColor: "transparent"
  },
  menuBtn: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    flex: 1,
    borderRadius: 0
  },
  menuText: {
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase"
  },
  menu: {
    position: "relative",
    minWidth: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 40,
    backgroundColor: "transparent"
  }
});

export default TabBar;
