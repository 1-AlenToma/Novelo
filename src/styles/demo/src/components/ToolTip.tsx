import * as React from "react";
import { View, Text, AnimatedView, TouchableOpacity } from "./ReactNativeComponents";
import { Button } from "./Button";
import { AlertViewFullProps, AlertViewProps, Size, ToastProps, ToolTipProps, ToolTipRef } from "../Typse";
import { globalData, InternalThemeContext } from "../theme/ThemeContext";
import StateBuilder from "react-smart-state";
import { ifSelector, newId, optionalStyle, setRef } from "../config";
import * as Native from "react-native"
import { Blur } from "./Blur";
import { useTimer } from "../hooks";

export const ToolTip = React.forwardRef<ToolTipRef, ToolTipProps>((props, ref) => {
    if (ifSelector(props.ifTrue) == false)
        return null;
    const context = React.useContext(InternalThemeContext);
    globalData.hook("window")
    const state = StateBuilder({
        visible: false,
        id: newId(),
        ref: undefined as Native.TouchableOpacity | undefined,
        pos: undefined as Size | undefined,
        toolTipSize: undefined as Size | undefined
    }).ignore("ref", "pos", "toolTipSize").build();
    const timer = useTimer(100)

    const fn = state.visible && state.pos ? context.add.bind(context) : context.remove.bind(context);

    setRef(ref, {
        visible: (value) => state.visible = value
    } as ToolTipRef);

    state.useEffect(() => {
        timer(() => {
            if (state.ref && !state.pos && state.visible)
                state.ref.measureInWindow((x, y, w, h) => {
                    state.pos = {
                        x: x,
                        y: y,
                        px: x,
                        py: y,
                        width: w,
                        height: h
                    }
                });
        })
    }, "ref", "visible")

    globalData.useEffect(() => {
        if (state.visible)
            state.visible = false;
    }, "window")

    state.useEffect(() => {
        if (!state.visible)
            state.pos = undefined;

    }, "visible")

    let left = state.pos?.px;
    let top = state.pos?.py;
    if (state.toolTipSize && state.pos) {
        left = left - (state.toolTipSize.width / 2)
        top = top + state.pos.height
        if (left + state.toolTipSize.width > globalData.window.width)
            left = globalData.window.width - (state.toolTipSize.width)
        else if (left < 0)
            left = 5
        if (!props.postion || props.postion == "Top") {
            top -= state.toolTipSize.height + state.pos.height;
            if (top < 0)
                top = 5
        }

    }

    fn(state.id, (
        <View key={state.id} css={x => x.fillView().maW("95%").cls("_abc").pos(0, 0).baC("$co-transparent")}>
            <Blur css="zi:1 bac:transparent" onPress={() => state.visible = false} />
            <View onLayout={({ nativeEvent }) => {
                state.toolTipSize = nativeEvent.layout
            }} style={[{
                left: left,
                top: top
            }]} css={x => x.joinLeft(`zi:2 bow:.5 pa:5 bor:5 flg:1 boc:#CCC mar:5`).cls("_abc", "ToolTip")}>
                {
                    typeof props.text == "string" ? <Text selectable={true} css="fos-sm">{props.text}</Text> : props.text
                }
            </View>
        </View>
    ))
    const style = optionalStyle(props.containerStyle);
    return (
        <TouchableOpacity ref={c => state.ref = c} onPress={() => {
            state.visible = !state.visible;
        }} style={[style.o]} css={x => x.joinRight(style.c)}>
            {props.children}
        </TouchableOpacity>
    )
});