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
import { useView } from "../hooks";

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
    iconSize?: number,
    style?: any
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
      context.theme.invertSettings()
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
              ? context.theme.settings
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
              context.theme.invertSettings(),
              i == cIndex
                ? context.theme.settings
                : undefined
            ]
          )}
          {!(x.props.title || "").empty() ? (
            <Text
              invertColor={true}
              style={[
                styles.menuText,
                i == cIndex
                  ? context.theme.settings
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
  scrollableHeader,
  css
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
  const [render, state, loader, timer] = useView({
    loader: { value: true },
    state: {
      rItems: children.map(x => {}),
      index: selectedIndex ?? 0
    },
    refItem: {
      startValue: undefined,
      handled: false,
      interpolate: [],
      panResponse: undefined
    },
    rootView: rootView,
    style: [
      style,
      {
        flex: 1,
        width: "100%",
        height: "100%",
        overflow: "hidden"
      }
    ]
  });

  const { animateX, animate } = useAnimate({});

  context.hook("theme.settings");
  const getWidth = (index: number) => {
    let v = index * state.size.width;
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

  state.refItem.interpolate = getInputRange();

  const tAnimate = (
    index: number,
    speed?: number,
    fn?: any
  ) => {
    let value =
      state.refItem.interpolate.find(
        x => x.index == index
      )?.value ?? 0;

    animateX(
      value,
      () => {
        fn?.();
      },
      speed
    );
  };

  const animateLeft = async (index: number) => {
    //while (isAnimating.current) await sleep(100);
    //setIndex(index);
    tAnimate(index, undefined, () => {
      state.index = index;
    });
  };

  let loadChildren = async (i: number) => {
    if (i >= 0 && i < children.length) {
      animateLeft(i);
    }
    if (!state.rItems[i] && children[i]) {
      state.rItems[i] = {
        child: childPrep(children[i])
      };
    }
  };

  useEffect(
    () => {
      children.forEach((x, i) => {
        if (state.rItems[i]) {
          state.rItems[i].child = childPrep(x);
        }
      });
      loadChildren(state.index);
    },
    children.map(x => x)
  );

  useEffect(() => {
    loadChildren(selectedIndex);
  }, [selectedIndex]);

  state.subscribe(() => {
    if (state.index !== undefined)
      change?.(state.index);
  }, "index");

  state.subscribe(() => {
    state.refItem.interpolate = getInputRange();
    tAnimate(state.index, 0);
  }, "size");

  useEffect(() => {
    state.refItem.interpolate = getInputRange();
    tAnimate(state.index, 0);
  }, [children]);

  const childPrep = child => {
    if (child) {
      if (!child.props.style) return child;
      if (Array.isArray(child.props.style))
        child.props.style.push({ flex: 1 });
      else child.props.style.flex = 1;
    }
    return child;
  };

  const assign = () => {
    const onRelease = (
      evt: any,
      gestureState: any
    ) => {
      if (state.refItem.handled) return;
      let newValue = gestureState.dx;
      let diff =
        newValue - state.refItem.startValue;
      let width = state.size.width;
      let i =
        state.index == undefined
          ? 0
          : state.index;

      animate.flattenOffset();
      let speed = 200;
      if (Math.abs(diff) > width / 3) {
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
      state.refItem.handled = true;
    };
    state.refItem.panResponse =
      PanResponder.create({
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
        onPanResponderGrant: (
          e,
          gestureState
        ) => {
          state.refItem.startValue =
            gestureState.dx;
          state.refItem.handled = false;
          //alert(interpolate.outputRange[index]);
          animate.setValue({
            x:
              state.refItem.interpolate.find(
                x => x.index == state.index
              )?.value ?? 0,
            y: 0
          });
          animate.extractOffset();
          return true;
        },
        onPanResponderTerminationRequest: () =>
          true,
        onPanResponderMove: Animated.event(
          [
            null,
            { dx: animate.x, dy: animate.y }
          ],
          { useNativeDriver: false }
        ),
        onPanResponderEnd: onRelease,
        onPanResponderRelease: onRelease
      });
  };
  assign();

  return render(
    <>
      {position === "Top" ? (
        <Menu
          index={state.index}
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
                      state.refItem.interpolate.map(
                        x => x.value
                      ),
                    outputRange:
                      state.refItem.interpolate.map(
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
              state.size.width * children.length
          }
        ]}
        {...state.refItem.panResponse
          .panHandlers}>
        {children.map((x, i) => (
          <View
            css="flex fg:1 bac:transparent"
            key={i}>
            {x.props.head}
            {!disableScrolling &&
            !x.props.disableScrolling ? (
              <ScrollView
                style={{
                  width: state.size.width,
                  maxHeight: scrollHeight
                }}
                contentContainerStyle={[css?.css(),{
                  flexGrow: 1,
                  padding: 5,
                  width: state.size.width,
                  maxWidth: "100%"
                }]}>
                {state.rItems[i]?.child ??
                  loader.elem}
              </ScrollView>
            ) : (
              state.rItems[i]?.child ??
              loader.elem
            )}
          </View>
        ))}
      </Animated.View>
      {position !== "Top" ? (
        <Menu
          index={state.index}
          children={children}
          loadChildren={loadChildren}
          scrollableHeader={scrollableHeader}
          fontSize={fontSize}
          position={position}
        />
      ) : null}
    </>
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
