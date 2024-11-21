
import * as ReactNative from "react-native"
import * as React from "react";
import "../Global";
import { ISize } from "../Types";
import Constants from "expo-constants";
export * from "../styles";

/*
type Props = {
    css?: string;
    ifTrue?: Function | boolean;
    invertColor?: boolean;
    rootView?: boolean;
    ready?: boolean;
}

type TypedStyle<T, P> = (props: P & Props) => React.ReactElement;
const StyledView = function ({ ...props }: Props & { View: any, children: any, removebg?: boolean, style?: any }) {
    if (methods.ifSelector(props.ifTrue) === false)
        return null;
    let keys: any[] = ["theme.settings"];
    if (props.rootView) keys.push("isFullScreen");
    context.hook(...keys);
    const state = buildState({
        id: methods.newId(),
        updater: methods.newId(),
        size: undefined as ISize | undefined,
        refItem: {
            style: undefined as any,
            init: false
        }
    }).ignore("refItem").build();

    const setStyle = (update: boolean) => {
        let style = methods.parseThemeStyleNoneHook(state.id, props.style, props.css, props.invertColor, props.rootView);
        if (props.removebg)
            style.push({ backgroundColor: null })
        //style = methods.removeProps(style, "backgroundColor");
        state.refItem.style = style;
        if (update)
            state.updater = methods.newId();
    }

    if (state.refItem.style === undefined)
        setStyle(false);
    useEffect(() => {
        if (state.refItem.init) {
            setStyle(true);

        }
    }, [props.style, props.invertColor, props.css, props.rootView, context.theme.settings])

    useEffect(() => {
        state.refItem.init = true;
        return () => methods.clearStyles(state.id);
    }, [])
    const st = state.refItem.style ?? [];

    if (props.rootView && !context.isFullScreen) {
        st.push({
            marginTop: Constants.statusBarHeight
        });
    }

    let Item = props.View;
    return (
        <Item {...props} style={state.refItem.style} onLayout={e => {
            if (
                props.ready &&
                e.nativeEvent.layout.height > 2
            ) {

                state.size = (e.nativeEvent.layout);
            }
            (props as any)?.onLayout?.(e);
        }}>
            {!props.ready || state.size ? props.children : null}
        </Item>
    );
}

const styledItems = {}

const Parser = function <T, P>(View: any, removebg?: boolean) {
    let Item = styledItems[View] ? StyledView[View] : (StyledView[View] = methods.StyledView(View, View.displayName ?? methods.newId()))
    return (({ ...props }) => <StyledView children={null} {...props} View={Item} removebg={removebg} />) as TypedStyle<T, P>
}

export const View = Parser<ReactNative.View, ViewProps>(ReactNative.View);
export const TouchableOpacity = Parser<ReactNative.TouchableOpacity, TouchableOpacityProps>(ReactNative.TouchableOpacity);
export const ScrollView = Parser<ReactNative.ScrollView, ScrollViewProps>(ReactNative.ScrollView);
export const Text = Parser<ReactNative.Text, TextProps>(ReactNative.Text, true);
export const AnimatedView = Parser<ReactNative.View, TextProps>(ReactNative.Animated.View);

*/


