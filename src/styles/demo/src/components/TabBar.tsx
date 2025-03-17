import {
    StyleSheet,
    Animated,
    Easing,
    SafeAreaView,
    PanResponder,
    ViewProps,
    TextStyle,
    Platform,
    ActivityIndicator
} from "react-native";
import * as React from "react";

import { View, AnimatedView, Text, TouchableOpacity, ScrollView } from "./ReactNativeComponents";
import {
    ifSelector,
    optionalStyle
} from "../config";
import { useAnimate, useTimer } from "../hooks";

import { MenuChildren, MenuIcon, MouseProps, Size, TabBarProps, TabItemProps, IConProps, CSS_String } from "../Typse";
import StateBuilder from "react-smart-state";
import { Icon } from "./Icon";
import { globalData } from "../theme/ThemeContext";
import { Loader } from "./Loader";


type ITabBarContext = {
    onChange: (index: number) => void;
    onMenuChange: (index?: number, menuInterpolate?: number[], menuItemWidth?: number) => void;
    selectedIndex: number;
    lazyLoading: boolean;
    size: Size;
    props: TabBarProps;
    animated: Animated.ValueXY;
}
const TabBarContext = React.createContext<ITabBarContext>({} as any)

export class TabView extends React.PureComponent<TabItemProps, {}> {
    static contextType = TabBarContext;
    render(): React.ReactNode {
        const props = this.props;
        const context: ITabBarContext = this.context as any;
        let css = optionalStyle(props.css);
        return (
            <View {...props} css={`fl:1 wi:100% he:100% bac-transparent ${css.c}`} />
        )
    }

}

const TabBarMenu = ({ children }: { children: MenuChildren[] }) => {
    const context = React.useContext(TabBarContext);
    const position = context.props.position ?? "Bottom";

    let menuItems = children.filter(
        x => ifSelector(x.props.ifTrue) !== false
    );

    const state = StateBuilder({
        selectedIndex: context.selectedIndex,
        manuItemSize: undefined as Size | undefined,
    }).build()

    let interpolate = menuItems.map(
        (_, i) => (state.manuItemSize?.width ?? i) * i
    );

    if (interpolate.length <= 1)
        interpolate = [0, 1];

    context.onChange = (index) => {
        state.selectedIndex = index;
    }

    state.useEffect(() => {
        context.onMenuChange(undefined, menuItems.map(
            (_, i) => (state.manuItemSize?.width ?? i) * i
        ), state.manuItemSize.width);
    }, "manuItemSize");

    let header = {
        style: optionalStyle(context.props.header?.style),
        textStyle: optionalStyle(context.props.header?.textStyle),
        selectedStyle: optionalStyle(context.props.header?.selectedStyle),
        selectedIconStyle: optionalStyle(context.props.header?.selectedIconStyle),
        selectedTextStyle: optionalStyle(context.props.header?.selectedTextStyle),
        overlayStyle: {
            container: optionalStyle(context.props.header?.overlayStyle?.container),
            content: optionalStyle(context.props.header?.overlayStyle?.content)
        }
    }

    const getIcon = (icon: IConProps & MenuIcon | undefined, style: any, index: number) => {
        if (!icon)
            return null;
        let IconView = icon.component ?? Icon;
        let iconProps = icon.type ? icon : {}
        let propStyle = icon.props && icon.props.style ? (Array.isArray(icon.props.style) ? icon.props.style : [icon.props.style]) : [];
        const iconStyle = icon.style ? (Array.isArray(icon.style) ? icon.style : [icon.style]) : [];
        let css: CSS_String = x => x.joinLeft(icon.css ?? icon.props?.css).joinRight(state.selectedIndex == index ? header.selectedIconStyle.c : undefined);
        propStyle = [style, ...propStyle, ...iconStyle];

        if (state.selectedIndex == index) {
            propStyle.push(header.selectedIconStyle.o);
        }

        propStyle = optionalStyle(propStyle).o;
        if (state.selectedIndex == index) {
            if (propStyle.color && /(co|color)( )?(\:)/gim.test(header.selectedIconStyle.c))
                delete propStyle.color;
        }

        return (<IconView {...iconProps} {...icon.props} style={propStyle} css={css} />)

    }
    if (menuItems.length <= 1) return null; // its a single View no need to display Menu Header;

    let border = (
        <AnimatedView
            css={header.overlayStyle.container.c}
            style={[
                {
                    backgroundColor: "#e5313a",
                },
                header.overlayStyle.container.o,
                {
                    zIndex: 100,
                    overflow: "visible",
                    borderRadius: 2,
                    height: 3,
                    width: state.manuItemSize?.width ?? 0,
                    transform: [
                        {
                            translateX: context.animated.x.interpolate({
                                inputRange: interpolate.sort((a, b) => a - b),
                                outputRange: interpolate,
                                extrapolate: "clamp"
                            })
                        }
                    ]
                }]}>
            <View
                onStartShouldSetResponder={event => false}
                onTouchStart={e => {
                    context.onMenuChange(state.selectedIndex);
                }}
                style={[
                    header.overlayStyle.content.o,
                    {
                        width: state.manuItemSize?.width,
                        height: state.manuItemSize?.height
                    },
                    position != "Top"
                        ? { bottom: -(state.manuItemSize?.height ?? 0) }
                        : { top: -(state.manuItemSize?.height ?? 0) }
                ]}
                css={`bac:yellow bow:1 boc:red bor:1 _overflow op:0.1 _abc ${header.overlayStyle.content.c}`}
            />
        </AnimatedView>
    );

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
    const menuText: any = {
        alignSelf: "center",
        textTransform: "uppercase",
    }
    return (
        <View css={x => x.cls("_tabBarMenu").if(position == "Bottom", x => x.boTC("$co-gray300").boTW(.5), x => x.boBC("$co-gray300").boBW(.5)).joinRight(header.style.c)} style={[header.style.o]}>
            {position != "Top" ? border : null}
            <View css="_tabBarContainerView bac-transparent">
                {menuItems.map((x, i) => (
                    <TouchableOpacity
                        onLayout={event => {
                            let item = event.nativeEvent.layout

                            if (!item.width || isNaN(item.width))
                                return;
                            state.manuItemSize = item;

                        }}
                        css={`bac-transparent _menuItem ${state.selectedIndex == i ? header.selectedStyle.c : ""}`}
                        style={[
                            i == state.selectedIndex
                                ? selectedStyle
                                : undefined,
                            state.selectedIndex == i ? header.selectedStyle.o : null
                        ]}
                        key={i}
                        onPress={() => {
                            // state.selectedIndex = i;
                            context.onMenuChange(i);
                        }}>
                        {x.props.icon ? getIcon(
                            x.props.icon,
                            {
                                ...menuText,
                                height: i == state.selectedIndex ? 15 : 18,
                                fontSize: i == state.selectedIndex ? 15 : 18
                            }, i
                        ) : null}
                        {x.props.title ? (
                            <Text
                                style={[{ ...menuText }, header.textStyle.o, state.selectedIndex == i ? header?.selectedTextStyle.o : null]}
                                css={`fos-sm ${state.selectedIndex == i ? header?.selectedTextStyle.o : ""} ${header.textStyle.c}`}>
                                {x.props.title}
                            </Text>
                        ) : null}
                    </TouchableOpacity>
                ))}
            </View>
            {position == "Top" ? border : null}
        </View>
    );
}

export const TabBar = (props: TabBarProps) => {
    const children = Array.isArray(props.children) ? props.children : [props.children];
    const position = props.position ?? "Bottom";
    const visibleChildren = children.filter(
        x => ifSelector(x.props.ifTrue) !== false && (x.props.title || x.props.icon)
    );
    const { animate, animateX, currentValue } = useAnimate();
    const menuAnimation = useAnimate();
    const temp = {};
    temp[props.selectedTabIndex ?? 0] = true;
    const state = StateBuilder({
        size: { width: globalData.window.width, height: globalData.window.height } as Size,
        index: props.selectedTabIndex ?? 0,
        refItem: {
            rItems: children.map(x => { }) as any as MenuChildren[],
            loadedViews: temp,
            menuInterpolate: undefined,
            menuItemWidth: undefined,
            startValue: undefined,
            handled: false,
            interpolate: [],
            panResponse: undefined
        }

    }).ignore("refItem").build();
    globalData.hook("window");
    const getWidth = (index: number) => {
        let v = index * (state.size.width ?? globalData.window.width);
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

        let value = state.refItem.interpolate.find(x => x.index == index)?.value ?? 0;
        if (state.refItem.menuInterpolate && state.refItem.menuInterpolate.length > 0)
            menuAnimation.animateX(
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
            state.index = index;
        });
    };

    let loadChildren = async (i: number, notAnimated?: boolean) => {
        if (i >= 0 && i < children.length && notAnimated != true) {
            animateLeft(i);
        }
        if (!state.refItem.rItems[i] && children[i]) {
            state.refItem.loadedViews[i] = true;
            if (children[i].props.onLoad)
                children[i].props.onLoad();
        }
    };

    const getView = (index, view) => {
        if (props.lazyLoading && !state.refItem.loadedViews[index])
            return (<Loader loading={true} text={props.loadingText} />)
        return view;
    }

    React.useEffect(() => {
        loadChildren(props.selectedTabIndex ?? 0);
    }, [props.selectedTabIndex]);

    state.useEffect(() => {
        if (state.index !== undefined) {
            props.onTabChange?.(state.index);
            contextValue.onChange?.(state.index);
        }

        //assign();
    }, "index");

    state.useEffect(() => {
        state.refItem.interpolate = getInputRange();
        tAnimate(state.index, 0);
    }, "size");

    React.useEffect(() => {
        state.refItem.interpolate = getInputRange();
    }, [children]);

    const assign = () => {
        const onRelease = (
            evt: any,
            gestureState: any
        ) => {

            if (state.refItem.handled) {
                //  console.warn(state.refItem.handled)
                // tAnimate(state.index, 0);
                return;
            }
            state.refItem.handled = true;
            currentValue.x = undefined;
            menuAnimation.currentValue.x = undefined;
            let newValue = gestureState.dx;
            let diff = newValue - state.refItem.startValue;
            let width = state.size.width;
            let i = state.index ?? 0;
            let speed = 200;
            menuAnimation.animate.flattenOffset();
            animate.flattenOffset();

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


            globalData.activePan = false;
            state.refItem.handled = true;
        };
        state.refItem.panResponse =
            PanResponder.create({
                onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                    return (Platform.OS === 'web' ? gestureState.numberActiveTouches > 0 : false) && gestureState.dx != 0;
                },
                onMoveShouldSetPanResponder: (
                    evt,
                    gestureState
                ) => {
                    const { dx, dy } = gestureState;
                    let lng = 20;
                    // context.panEnabled &&
                    return globalData.panEnabled && (visibleChildren.length > 1 &&
                        (dx > lng || dx < -lng)
                    );
                },
                onPanResponderGrant: (
                    e,
                    gestureState
                ) => {

                    state.refItem.startValue = gestureState.dx;
                    state.refItem.handled = false;
                    globalData.activePan = true;
                    let x1 = state.refItem.interpolate.find(x => x.index == state.index)?.value;
                    let x2 = state.refItem.menuInterpolate[state.index];
                    if (!isNaN(x1))
                        animate.x.setValue(x1);
                    if (!isNaN(x2))
                        menuAnimation.animate.x.setValue(x2);
                    animate.extractOffset();
                    menuAnimation.animate.extractOffset();
                    return true;
                },
                onPanResponderTerminationRequest: (
                    ev,
                    gus
                ) => {
                    // onRelease(ev, gus);
                    return true;
                },
                onPanResponderTerminate: onRelease,
                onPanResponderMove: (event, gestureState) => {
                    let newValue = gestureState.dx;
                    let diff = newValue - state.refItem.startValue;
                    let isng = diff < 0;

                    diff = Math.abs(diff) / children.length;
                    diff = Math.min(diff, state.refItem.menuItemWidth);

                    animate.x.setValue(state.refItem.startValue + newValue)

                    menuAnimation.animate.setValue({
                        x: isng ? diff : -diff,
                        y: 0
                    });
                    //  menuAnimate.animate.extractOffset();
                },
                onPanResponderEnd: onRelease,
                onPanResponderRelease: onRelease
            });
    };
    assign();




    const contextValue: ITabBarContext = {
        onChange: (index: number) => { },
        onMenuChange: (index?: number, menuInterpolate?: number[], menuItemWidth?: number) => {
            if (index != undefined)
                loadChildren(index)
            else if (menuInterpolate) {
                state.refItem.menuInterpolate = menuInterpolate;
                state.refItem.menuItemWidth = menuItemWidth;
                menuAnimation.animateX(
                    state.refItem.menuInterpolate[
                    state.index
                    ],
                    undefined,
                    0
                );
            }
        },
        props: props,
        lazyLoading: props.lazyLoading ?? false,
        selectedIndex: state.index ?? 0,
        size: state.size,
        animated: menuAnimation.animate
    }



    return (
        <View onLayout={({ nativeEvent }) => {
            state.size = nativeEvent.layout;
        }} css={x => x.cls("_tabBar").joinRight(props.css)} style={props.style}>
            <TabBarContext.Provider value={contextValue}>
                {position === "Top" && visibleChildren.length > 1 ? (
                    <TabBarMenu children={children} />
                ) : null}
                <AnimatedView
                    css={`_tabBarContainer`}
                    style={[
                        (visibleChildren.length <= 1 ? {
                            minHeight: null,
                            height: null
                        } : null),
                        {
                            flex: 1,
                            flexGrow: 1,
                            transform: [
                                {
                                    translateX: animate.x.interpolate(
                                        {
                                            inputRange: state.refItem.interpolate.map(x => x.value),
                                            outputRange: state.refItem.interpolate.map(x => x.value),
                                            extrapolate: "clamp"
                                        }
                                    )
                                }
                            ],
                            width: (100 * children.length) + "%"
                        }
                    ]}
                    {...state.refItem.panResponse.panHandlers}>
                    {children.map((x, i) => (
                        <View
                            style={{
                                maxWidth: state.size.width,
                                width: state.size.width,
                                flexGrow: 1,
                                backgroundColor: "transparent"
                            }}
                            key={i}>
                            {x.props.head}
                            {!props.disableScrolling && !x.props.disableScrolling ? (
                                <ScrollView
                                    style={{
                                        width: "100%",
                                    }}
                                    contentContainerStyle={
                                        {
                                            flexGrow: 1,
                                            width: "100%",
                                            maxWidth: "100%"
                                        }
                                    }>
                                    {getView(i, x)}
                                </ScrollView>
                            ) : (
                                getView(i, x)
                            )}
                        </View>
                    ))}
                </AnimatedView>
                {position !== "Top" && visibleChildren.length > 1 ? (
                    <TabBarMenu children={children} />
                ) : null}
                {props.footer}
            </TabBarContext.Provider>
        </View>
    );
}