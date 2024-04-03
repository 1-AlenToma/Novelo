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
import useLoader from "./Loader";
import * as Icons from "@expo/vector-icons";
import {
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback
} from "react";
import {
  sleep,
  newId,
  removeProps,
  proc,
  ifSelector
} from "../Methods";
import GlobalData from "../GlobalContext";
import {
  useUpdate,
  useTimer,
  useAnimate
} from "../hooks";
import Text from "./ThemeText";
import { TabIcon, TabChild } from "../Types";

const Menu = ({
  children,
  index,
  loadChildren,
  scrollableHeader,
  fontSize,
  position
}: any) => {
  let use;
  let [cIndex, setCIndex] = useState(index ?? 0);

  useEffect(() => {
    setCIndex(index);
  }, [index]);

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

  const selectedStyle =
    position != "Top"
      ? {
          borderTopWidth: 2,
          borderTopColor: "#ffff2d"
        }
      : {
          borderBottomWidth: 2,
          borderBottomColor: "#ffff2d"
        };

  let MContainer = View;
  let prop = {
    style: [
      styles.menu,
      GlobalData.theme.invertSettings()
    ]
  };
  let menuItems = children.filter(
    x => ifSelector(x.props.ifTrue) !== false
  );

  if (scrollableHeader) {
    MContainer = ScrollView;
    prop = {
      contentContainerStyle: prop.style,
      style: {
        minHeight: 40,
        height: 40,
        flex: 0,
        flexGrow: 1
      },
      horizontal: true
    };
  }
  if (menuItems.length <= 1) return null;
  return (
    <MContainer {...prop}>
      {menuItems.map((x, i) => (
        <TouchableOpacity
          style={[
            styles.menuBtn,
            i == cIndex
              ? GlobalData.theme.settings
              : undefined,
            i == cIndex
              ? selectedStyle
              : undefined
          ]}
          key={i}
          onPress={() => {
            loadChildren(i);
            setCIndex(i);
          }}>
          {getIcon(
            x.props.icon,
            i == cIndex ? 15 : 18,
            [
              styles.menuText,
              GlobalData.theme.invertSettings(),
              i == cIndex
                ? GlobalData.theme.settings
                : undefined
            ]
          )}
          {!(x.props.title || "").empty() ? (
            <Text
              invertColor={true}
              style={[
                styles.menuText,
                i == cIndex
                  ? GlobalData.theme.settings
                  : undefined
              ]}
              css={`desc fos:${fontSize ?? 9}`}>
              {x.props.title}
            </Text>
          ) : null}
        </TouchableOpacity>
      ))}
    </MContainer>
  );
};

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
  const loader = useLoader(true);
  const [size, setSize] = useState(undefined);
  const update = useUpdate();
  GlobalData.hook("theme.settings");
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
  const interpolate = useRef(getInputRange());

  const [rItems, setrItems] = useState(
    children.map(x => {})
  );
  const panResponse = useRef();
  const { animateX, animate } = useAnimate({
    
  });

  const [index, setIndex] = useState(
    selectedIndex ?? 0
  );

  const tAnimate = (
    index: number,
    speed?: number,
    fn: any
  ) => {
    let value =
      interpolate.current.find(
        x => x.index == index
      )?.value ?? 0;

    animateX(value, fn, speed);
  };

  const animateLeft = async (index: number) => {
    //while (isAnimating.current) await sleep(100);
    if (!size) return;
    //setIndex(index);
    tAnimate(index, undefined, () => {
      setIndex(index);
    });
  };

  let loadChildren = async (i: number) => {
    if (i >= 0 && i < children.length) {
      animateLeft(i);
    }
    if (!rItems[i] && children[i]) {
      rItems[i] = {
        child: childPrep(children[i])
      };
    }
  };

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

  useEffect(() => {
    interpolate.current = getInputRange();
    tAnimate(index, 0);
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
  interpolate.current = getInputRange();
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
        dx > lng ||
        dx < -lng ||
        dy > lng ||
        dy < -lng
      );
    },
    onPanResponderGrant: (e, gestureState) => {
      startValue.current = gestureState.dx;
      //alert(interpolate.outputRange[index]);
      animate.setValue({
        x:
          interpolate.current.find(
            x => x.index == (index ?? 0)
          )?.value ?? 0,
        y: 0
      });
      animate.extractOffset();
      return true;
    },
    onPanResponderMove: Animated.event(
      [null, { dx: animate.x, dy: animate.y }],
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
      animate.flattenOffset();
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
      //return false;
    }
  });

  return (
    <View
      rootView={rootView}
      style={[
        style,
        {
          flex: 1,
          width: "100%",
          height: "100%",
          overflow: "hidden"
        }
      ]}
      onLayout={event => {
        setSize(event.nativeEvent.layout);
      }}>
      {position === "Top" ? (
        <Menu
          index={index}
          children={children}
          loadChildren={loadChildren}
          scrollableHeader={scrollableHeader}
          fontSize={fontSize}
          position={position}
        />
      ) : null}
      <Animated.View
        style={[
          styles.container,
          {
            flex: position === "Top" ? 0 : 1,
            flexGrow: 1,
            backgroundColor: "transparent",
            transform: [
              {
                translateX: animate.x.interpolate(
                  {
                    inputRange:
                      interpolate.current.map(
                        x => x.value
                      ),
                    outputRange:
                      interpolate.current.map(
                        x => x.value
                      ),
                    extrapolateLeft: "extend",
                    extrapolate: "clamp"
                  }
                )
              }
            ],
            /* height: (0).sureValue(
              size?.height -
                (menu ? styles.menu.height : 0)
            ),*/
            width:
              (size?.width ?? 0) * children.length
          }
        ]}
        {...panResponse.current.panHandlers}>
        {children.map((x, i) => (
          <View
            css="flex fg:1 bac:transparent"
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
                {rItems[i]?.child ?? loader.elem}
              </ScrollView>
            ) : (
              rItems[i]?.child ?? loader.elem
            )}
          </View>
        ))}
      </Animated.View>
      {position !== "Top" ? (
        <Menu
          index={index}
          children={children}
          loadChildren={loadChildren}
          scrollableHeader={scrollableHeader}
          fontSize={fontSize}
          position={position}
        />
      ) : null}
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
    flex: 1,
    borderRadius: 0,
    height: 40
  },
  menuText: {
    alignSelf: "center",
    textTransform: "uppercase"
  },
  menu: {
    position: "relative",
    minWidth: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    maxHeight: 40,
    height: 40,
    flex: 0,
    flexGrow: 1,
    backgroundColor: "transparent"
  }
});

export default TabBar;
