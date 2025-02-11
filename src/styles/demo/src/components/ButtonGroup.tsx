import { Icon } from "./Icon";
import { View, AnimatedView, Text, TouchableOpacity, ScrollView } from "./ReactNativeComponents";
import { InternalThemeContext, globalData } from "../theme/ThemeContext";
import { useAnimate, useTimer } from "../hooks";
import StateBuilder from "react-smart-state";
import * as Native from "react-native";
import { ifSelector, newId, proc, optionalStyle } from "../config";
import * as React from "react";
import { ButtonGroupProps, PortalProps, Size } from "../Typse";


export const ButtonGroup = (props: ButtonGroupProps) => {
    const state = StateBuilder({
        selectedIndex: props.selectedIndex,
        scrollView: undefined as typeof ScrollView | undefined,
        sizes: new Map<number, Size>()
    }).ignore("scrollView", "selectedIndex", "sizes").build();
    const timer = useTimer(200);


    const select = (index: number) => {
        if (!props.selectMultiple)
            state.selectedIndex = [index];
        else {
            if (state.selectedIndex.includes(index))
                state.selectedIndex = state.selectedIndex.filter(x => x !== index);
            else state.selectedIndex = [...state.selectedIndex, index]
        }

        props.onPress?.(state.selectedIndex, props.buttons.filter((x, i) => state.selectedIndex.includes(i)));
    }

    const scrollToItem = () => {
        timer(() => {
            if (state.scrollView && state.sizes.size > 0 && state.selectedIndex.length == 1) {
                if (props.isVertical)
                    state.scrollView.scrollTo({ y: [...state.sizes.values()].reduce((a, b, index) => a + (index < state.selectedIndex[0] ? b.height : 0), 0), animated: false });
                else state.scrollView.scrollTo({ x: [...state.sizes.values()].reduce((a, b, index) => a + (index < state.selectedIndex[0] ? b.width : 0), 0), animated: false });
            }
        });
    }

    React.useEffect(() => {
        state.selectedIndex = props.selectedIndex;
        //state.scrollView = undefined;
    }, [props.selectedIndex])

    state.useEffect(() => {
        scrollToItem();
    }, "scrollView", "selectedIndex")

    const getItem = (item: string, index: number) => {
        const itemStyle = props.itemStyle?.(item, index);
        
        return (
            <TouchableOpacity
                onLayout={({ nativeEvent }) => state.sizes.set(index, nativeEvent.layout)}
                onPress={() => select(index)}
                style={[props.scrollable ? undefined : { flex: 1 }]} key={index}
                css={x => x.cls("_buttonGroupButton", "ButtonGroupButton").if(props.isVertical == true, c => c.wi("100%")).if(state.selectedIndex.includes(index), c => c.cls("selectedValue").joinRight(props.selectedStyle)).joinRight(itemStyle?.container)}>
                {
                    props.render ? props.render(item, index) : <Text css={x => x.joinRight(itemStyle?.text).if(state.selectedIndex.includes(index), c => c.cls("selectedValue").joinRight(props.selectedStyle))}>{item}</Text>
                }
            </TouchableOpacity>
        )
    }

    const Component = props.scrollable ? ScrollView : View;
    const cProps = props.scrollable ? { contentContainerStyle: { flex: 0 }, ref: c => state.scrollView = c } : { style: { flex: 1, backgroundColor: "transparent" } }
    return (
        <View ifTrue={props.ifTrue} css={x => x.cls("_buttonGroup", "ButtonGroup").joinRight(props.css)} style={props.style}>
            <Component horizontal={!props.isVertical} {...cProps} >
                <View style={props.style} css={x => x.cls("_buttonGroupCenter").if(props.isVertical, c => c.flD("column"), c => c.flD("row")).joinRight(props.css)}>
                    {
                        props.buttons.map((x, index) => getItem(x, index))
                    }
                </View>
            </Component>
        </View>
    )
}