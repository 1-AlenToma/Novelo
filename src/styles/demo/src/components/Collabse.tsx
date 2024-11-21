import * as React from "react";
import { AnimatedView, TouchableOpacity, View, Text, ScrollView, TextInput } from "./ReactNativeComponents";
import { globalData, InternalThemeContext } from "../theme/ThemeContext";
import { useAnimate } from "../hooks";
import StateBuilder from "react-smart-state";
import { ViewStyle } from "react-native";
import { ifSelector, newId, optionalStyle, setRef } from "../config";
import { CollabseProps, DropdownItem, DropdownListProps, DropdownRefItem, ModalProps } from "../Typse";
import { Modal } from "./Modal";
import { ActionSheet } from "./ActionSheet";
import { Icon } from "./Icon";
import * as ReactNtive from "react-native";

export const Collabse = React.forwardRef<DropdownRefItem, CollabseProps>((props, ref) => {

    const state = StateBuilder({
        visible: props.defaultActive ?? false,
        prefix: props.defaultActive ? "minus" : "plus"
    }).build();

    const { animate, animateY, animateX } = useAnimate({ speed: 300 });
    const show = () => {
        animateX(state.visible ? 1 : 0, () => {
            
        }, 1000)
        animateY(state.visible ? 1 : 0, () => {
            state.prefix = state.visible ? "minus" : "plus"
        })
    }

    setRef(ref, {
        open: () => state.visible = true,
        close: () => state.visible = false,
        selectedValue: state.visible
    });

    React.useEffect(() => {
        show();
    }, [])

    state.useEffect(() => show(), "visible")
    if (ifSelector(props.ifTrue) == false)
        return null;

    return (
        <View style={props.style} css={x => x.joinRight(`bor:5 wi:100% mih:30 bow:.5 boc:#CCC _overflow pa:5`).joinRight(props.css)}>
            <TouchableOpacity onPress={() => state.visible = !state.visible} css="wi:100% he:30 ali:center fld:row">
                {props.icon}
                <Text css="fos-lg fow:bold">{props.text}</Text>
                <Icon type="AntDesign" css="_abc ri:2" size={20} name={state.prefix} />
            </TouchableOpacity>
            <AnimatedView css="wi:100% pal:10" style={{
                overflow: "hidden",
                maxHeight: animate.y.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, globalData.window.height],
                    extrapolate: "clamp"
                })
            }}>
                <AnimatedView style={{
                    flex: 0,
                    flexGrow: 1,
                    opacity: animate.x.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                        extrapolate: "clamp"
                    })

                }}>
                    {props.children}
                </AnimatedView>
            </AnimatedView>
        </View>
    )

})