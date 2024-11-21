import * as React from "react";
import { View, Text, AnimatedView } from "./ReactNativeComponents";
import { Button } from "./Button";
import { AlertViewFullProps, AlertViewProps, CSS_String, Size, ToastProps } from "../Typse";
import { globalData, InternalThemeContext } from "../theme/ThemeContext";
import StateBuilder from "react-smart-state";
import { newId } from "../config";
import { useAnimate, useTimer } from "../hooks";
import { ProgressBar } from "./ProgressBar";
import { Icon } from "./Icon";
import { Platform, StatusBar } from 'react-native';

export const ToastView = () => {
    globalData.hook("screen", "alertViewData.toastData");
    const { animate, animateY, currentValue } = useAnimate();
    const data = globalData.alertViewData.toastData ?? {} as ToastProps;
    data.position = data.position ?? "Top";
    const context = React.useContext(InternalThemeContext);
    const timer = useTimer(100);
    const state = StateBuilder({
        size: undefined as Size,
        id: newId(),
        counter: 0,
        visible: false
    }).ignore("id").build();
    let fn = data.message ? context.add.bind(context) : context.remove.bind(context);
    let interpolate = [0, 1];

    const startCounter = () => {
        if (data.loader == false)
            return;
        state.counter += data.loaderCounter ?? .01;
        if (state.counter < 1)
            timer(() => startCounter());
        else state.visible = false;
    }


    if (state.size) {
        if (data.position == "Top") {
            interpolate = [-state.size.height, Platform.OS == "web" ? 5 : StatusBar.currentHeight];
        } else {
            interpolate = [globalData.window.height + state.size.height, (globalData.window.height - state.size.height) - 30];
        }
    }

    const animateTop = () => {
        const v = state.visible ? 1 : 0;
        if (currentValue.y == v || !state.size)
            return;

        timer.clear();
        animateY(v, () => {
            if (state.visible) {
                state.counter = 0;
                startCounter();
            }


            if (!state.visible) {
                state.counter = 0;
                state.size = undefined;
                globalData.alertViewData.toastData = undefined;
                timer.clear();
            }
        });
    }

    globalData.useEffect(() => {
        state.counter = 0;
        state.visible = globalData.alertViewData.toastData != undefined;
    }, "alertViewData.toastData")

    state.useEffect(() => {
        if (state.size)
            animateTop();
    }, "visible", "size")

    let typeInfo = {
        css: undefined as CSS_String | undefined,
        icon: undefined
    }

    switch (data.type) {
        case "Error":
            typeInfo = {
                css: `_${data.type.toLowerCase()}`,
                icon: (<Icon type="MaterialIcons" name="error" size={30} css="co:white" />)
            }
            break;
        case "Info":
            typeInfo = {
                css: `_${data.type.toLowerCase()}`,
                icon: (<Icon type="AntDesign" name="infocirlce" size={30} css="co:white" />)
            }
            break;
        case "Warning":
            typeInfo = {
                css: `_${data.type.toLowerCase()}`,
                icon: (<Icon type="FontAwesome" name="warning" size={30} css="co:white" />)
            }
            break;
        case "Success":
            typeInfo = {
                css: `_${data.type.toLowerCase()}`,
                icon: (<Icon type="Entypo" name="check" size={30} css="co:white" />)
            }
            break;
    }

    fn(state.id, <AnimatedView key={state.id} onLayout={({ nativeEvent }) => {
        if (!state.size)
            state.size = nativeEvent.layout;
    }} style={{
        left: state.size ? (globalData.window.width - state.size.width) / 2 : 0,
        top: !state.size ? (data.position == "Bottom" ? "100%" : "-100%") : 0,
        transform: [{
            translateY: animate.y.interpolate({
                inputRange: [0, 1],
                outputRange: interpolate,
                extrapolate: "clamp"
            })
        }]
    }} css={x => x.cls("_toast").joinRight(typeInfo.css).joinRight(data.css)}>
        <View>
            <View css={x => x.cls("_abc").fl(1).fillView().pos(0, 0).zI(3).alI("flex-end").baC("$co-transparent")}>
                <Button onPress={() => state.visible = false} css={
                    x => x.cls("sh-none", "_center").size(30, 30).baC("$co-transparent").paL(1).boW(0)
                } icon={<Icon type="AntDesign" name="close" size={15} />} />
            </View>
            <View ifTrue={data.icon != undefined || typeInfo.icon != undefined} css="fl:1 maw:40 zi:1 bac:transparent">
                {data.icon ?? typeInfo.icon}
            </View>
            <View css="fl:1 zi:1 bac:transparent">
                <Text ifTrue={data.title != undefined} css={x => x.joinLeft("fos-lg maw:90% fow:bold").joinRight(typeInfo.css)}>{data.title}</Text>
                <Text css={x => x.joinLeft(`fos-sm maw:90% pab:5`).joinRight(typeInfo.css)}>{data.message}</Text>
            </View>
        </View>
        <ProgressBar ifTrue={data.loader !== false} color={data.loaderBg} children={null} value={state.counter} css="_toastProgressView" />
    </AnimatedView>, true)

    return null;
}