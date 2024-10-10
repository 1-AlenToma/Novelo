import {
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  PanResponder
} from "react-native";
import * as React from "react";

import View from "./ThemeView";
import AnimatedView from "./AnimatedView";
import useLoader from "./Loader";
import * as Icons from "@expo/vector-icons";
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
  loadChildren,
  scrollableHeader,
  fontSize,
  position,
  onSize,
  minuWidth,
  animated,
  parentState
}: any) => {
  let menuItems = children.filter(
    x => ifSelector(x.props.ifTrue) !== false
  );
  let timer = useTimer(10);
  let [cIndex, setCIndex] = useState(
    parentState.refItem.index ?? 0
  );
  const [size, setSize] = useState([]);
  let interpolate = menuItems.map(
    (_, i) => (size[0]?.width ?? i) * i
  );
  
  if (interpolate.length <= 1)
    interpolate = [0, 1];

  parentState.useEffect(() => {
    setCIndex(parentState.refItem.index);
  }, "refItem.index");

  useEffect(() => {
    onSize?.(interpolate, size[0]?.width);
  }, [size]);

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
  scrollableHeader = false;
  let selectedStyle: any =
    position != "Top"
      ? {
          borderTopWidth: 2,
          borderTopColor: "#ffff2d"
        }
      : {
          borderBottomWidth: 2,
          borderBottomColor: "#ffff2d"
        };
  //if (!scrollableHeader)
  selectedStyle = {};
  let MContainer = View;
  let prop: any = {
    style: [
      styles.menu,
      context.theme.invertSettings()
    ]
  };

  if (scrollableHeader) {
    MContainer = ScrollView;
    prop = {
      contentContainerStyle: prop.style,
      style: {
        zIndex: 99,
        minHeight: 40,
        height: 40,
        flex: 0,
        flexGrow: 1
      },
      horizontal: true
    };
  }
  if (menuItems.length <= 1) return null;

  let border = (
    <AnimatedView
      style={{
        zIndex: 100,
        overflow: "visible",
        borderRadius: 2,
        height: 3,
        backgroundColor: "#e5313a",
        width: size[0]?.width ?? 0,
        transform: [
          {
            translateX: animated.x.interpolate({
              inputRange: interpolate.sort(
                (a, b) => a - b
              ),
              outputRange: interpolate,
              extrapolateLeft: "extend",
              extrapolate: "clamp"
            })
          }
        ]
      }}>
      <View
        onStartShouldSetResponder={event => false}
        onTouchStart={e => {
          loadChildren(cIndex);
        }}
        style={[
          {
            width: size[0]?.width,
            height: size[0]?.height
          },
          position != "Top"
            ? { bottom: -(size[0]?.height ?? 0) }
            : { top: -(size[0]?.height ?? 0) }
        ]}
        css="bac:yellow bow:1 boc:red bor:1 overflow op:0.1 absolute"
      />
    </AnimatedView>
  );
  return (
    <View css="clearwidth">
      {position != "Top" ? border : null}
      <MContainer {...prop}>
        {menuItems.map((x, i) => (
          <TouchableOpacity
            onLayout={event => {
              let item = {
                ...event.nativeEvent.layout
              };

              if (
                i != 0 ||
                !item.width ||
                isNaN(item.width)
              )
                return;
              if (size[i]) size[i] = item;
              else size.push(item);
              setSize([...size]);
            }}
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
      {position == "Top" ? border : null}
    </View>
  );
};

const childPrep = child => {
  if (child) {
    if (!child.props.style) return child;
    if (Array.isArray(child.props.style))
      child.props.style.push({ flex: 1 });
    else child.props.style.flex = 1;
  }
  return child;
};

const Child = ({
  state,
  index,
  loadItem,
  item
}: any) => {
  let update = useUpdate();
  let child: any =
    state.refItem.rItems[index]?.child ?? null;

  let load = (isUpdate?: boolean) => {
    if (
      (index == state.refItem.index ||
        (isUpdate && child != null)) &&
      (child == null || isUpdate)
    ) {
      state.refItem.rItems[index] = {
        child: childPrep(item)
      };
      update();
    }
  };
  state.useEffect(() => {
    load();
  }, "refItem.index");

  useEffect(() => {
    load(true);
  }, [item]);

  return child ?? loadItem ?? null;
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
  css,
  loadAll,
  ifTrue
}: {
  children: TabChild[];
  ifTrue?: any;
  style?: any;
  selectedIndex?: number;
  position?: "Bottom" | "Top";
  disableScrolling?: boolean;
  change?: (index) => void;
  rootView?: boolean;
  scrollableHeader?: boolean;
  scrollHeight?: any;
  fontSize?: number;
  css?: string;
  loadAll?: boolean;
}) => {
  if (methods.ifSelector(ifTrue) == false)
      return null;
  const visibleChildren = children.filter(
    x => ifSelector(x.props.ifTrue) !== false
  );
  const [render, state, loader, timer] = useView({
    loader: { value: true },
    component: View,
    state: {},
    refItem: {
      rItems: children.map(x => {}),
      index: selectedIndex ?? 0,
      menuInterpolate: undefined,
      menuItemWidth: undefined,
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

  state.bind("refItem.index");

  const { animateX, animate } = useAnimate();
  const menuAnimate = useAnimate();

  context.hook("theme.settings");
  const getWidth = (index: number) => {
    let v = index * (state.size.width ?? context.size.window.width);
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
    menuAnimate.animateX(
      state.refItem.menuInterpolate[index],
      undefined,
      speed
    );
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
      state.refItem.index = index;
    });
  };

  let loadChildren = async (
    i: number,
    notAnimated?: boolean
  ) => {
    if (
      i >= 0 &&
      i < children.length &&
      notAnimated != true
    ) {
      animateLeft(i);
    }
    if (!state.refItem.rItems[i] && children[i]) {
      if (children[i].props.onLoad)
        children[i].props.onLoad();
    }
  };

  useEffect(() => {
    loadChildren(selectedIndex ?? 0);
  }, [selectedIndex]);

  state.useEffect(() => {
    if (state.refItem.index !== undefined)
      change?.(state.refItem.index);
    //assign();
  }, "refItem.index");

  state.useEffect(() => {
    state.refItem.interpolate = getInputRange();
    tAnimate(state.refItem.index, 0);
  }, "size");

  useEffect(() => {
    state.refItem.interpolate = getInputRange();
    // tAnimate(state.refItem.index, 0);
  }, [children]);

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
      let i = state.refItem.index ?? 0;
      menuAnimate.animate.flattenOffset();
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
          const { dx, dy } = gestureState;
          let lng = 5;

          return (visibleChildren.length >1 &&
            context.panEnabled &&
            (dx > lng ||
              dx < -lng ||
              dy > lng ||
              dy < -lng)
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
                x =>
                  x.index == state.refItem.index
              )?.value ?? 0,
            y: 0
          });
          animate.extractOffset();
          menuAnimate.animate.setValue({
            x:
              state.refItem.menuInterpolate[
                state.refItem.index
              ] ?? 0,
            y: 0
          });
          menuAnimate.animate.extractOffset();
          return true;
        },
        onPanResponderTerminationRequest: (
          ev,
          gus
        ) => {
          // onRelease(ev, gus);
          return true;
        },
        onPanResponderTerminate: () => {
          //tAnimate(state.refItem.index ?? 0, 1);
          return true;
        },
        onPanResponderMove: Animated.event(
          [
            null,
            { dx: animate.x, dy: animate.y }
          ],
          {
            useNativeDriver: false,
            listener: (
              event,
              gestureState
            ) => {
              let newValue = gestureState.dx;
              let diff =
                newValue -
                state.refItem.startValue;
              let isng = diff < 0;
              
              diff = Math.abs(diff) / children.length;
              diff = Math.min(diff, state.refItem.menuItemWidth);

              // console.warn(b - diff);

              menuAnimate.animate.setValue({
                x: isng ? diff : -diff,
                y: 0
              });
              //  menuAnimate.animate.extractOffset();
            }
          }
        ),
        onPanResponderEnd: onRelease,
        onPanResponderRelease: onRelease
      });
  };
  assign();

  let loadItem = (
    <View
      ifTrue={() => (loader.elem ? true : false)}
      css="absolute clearboth zi:500">
      <View css="clearboth he:80 zi:500 juc:center ali:center absolute le:0 to:40%">
        {loader.elem}
      </View>
    </View>
  );

  return render(
    <>
      {position === "Top" ? (
        <Menu
          onSize={(
            menuInterpolate,
            menuItemWidth
          ) => {
            state.refItem.menuInterpolate =
              menuInterpolate;
            state.refItem.menuItemWidth =
              menuItemWidth;
            menuAnimate.animateX(
              state.refItem.menuInterpolate[
                state.refItem.index
              ],
              undefined,
              0
            );
          }}
          animated={menuAnimate.animate}
          parentState={state}
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
            width: 100 * children.length + "%"
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
                  width: "100%",
                  maxHeight: scrollHeight
                }}
                contentContainerStyle={[
                  css?.css(),
                  {
                    flexGrow: 1,
                    padding: 5,
                    width: "100%",
                    maxWidth: "100%"
                  }
                ]}>
                <Child
                  item={x}
                  state={state}
                  index={i}
                />
              </ScrollView>
            ) : (
              <Child
                item={x}
                state={state}
                index={i}
                loadItem={loadItem}
              />
            )}
          </View>
        ))}
      </Animated.View>
      {position !== "Top" ? (
        <Menu
          onSize={(
            menuInterpolate,
            menuItemWidth
          ) => {
            state.refItem.menuInterpolate =
              menuInterpolate;
            state.refItem.menuItemWidth =
              menuItemWidth;
            menuAnimate.animateX(
              state.refItem.menuInterpolate[
                state.refItem.index
              ],
              undefined,
              0
            );
          }}
          animated={menuAnimate.animate}
          parentState={state}
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