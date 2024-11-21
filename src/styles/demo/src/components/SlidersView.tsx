import { View, AnimatedView, Text, TouchableOpacity, ScrollView, Slider } from "./ReactNativeComponents";
import * as React from "react";
import {
    useAnimate,
    useTimer
} from "../hooks";
import { ifSelector, optionalStyle, proc, readAble } from "../config";
import { CSS_String, Size, StyledProps } from "../Typse";
import { Button } from "./Button";
import { Icon } from './Icon';
import StateBuilder from 'react-smart-state';
import { ViewStyle } from 'react-native';
import * as NativeSlider from '@miblanchard/react-native-slider';
import { globalData } from "../theme/ThemeContext";

export const SliderView = (props: NativeSlider.SliderProps & {
    enableButtons?: boolean,
    buttonCss?: CSS_String,
    ifTrue?: () => boolean | boolean,
    style?: ViewStyle,
    css?: string
}) => {
    if (ifSelector(props.ifTrue) == false)
        return null;
    const state = StateBuilder({
        value: props.value,
        sliding: false
    }).build();
    const timer = useTimer(800)

    let btnValue = typeof state.value == "number" ? state.value : ((state.value as []).length <= 1 ? state.value[0] : undefined);
    let step = props.step != undefined ? props.step : 1;

    const onChange = (value: any, index?: number) => {
        state.value = btnValue = value;
        timer(() => {
            state.sliding = false;
        });
        (props.onSlidingComplete || props.onValueChange)?.(typeof value == "number" ? [value] : value, index ?? 0)
    }

    React.useEffect(() => {
        if (props.value !== state.value)
            state.value = props.value;
    }, [props.value])

    const minus = () => {
        if (btnValue - step >= props.minimumValue)
            onChange(btnValue - step)
        else if (btnValue > props.minimumValue)
            onChange(props.minimumValue)
    }

    const plus = () => {
        if (btnValue + step <= props.maximumValue)
            onChange(btnValue + step)
        else if (btnValue < props.maximumValue)
            onChange(props.maximumValue);
    }

    return (
        <View css={x => x.cls("_slider juc:space-between").joinRight(props.css)} style={props.style}>
            <Button css={x => x.cls("_sliderButton").joinRight(props.buttonCss)}
                icon={<Icon type="AntDesign" size={15} color="white" name="minus" />}
                ifTrue={props.enableButtons && btnValue != undefined}
                onPressIn={() => state.sliding = true}
                whilePressed={minus} onPress={minus}></Button>

            <Slider
                onStartShouldSetResponder={event =>
                    false
                }
                renderAboveThumbComponent={!state.sliding ? undefined : () => <Text css="_sliderThump">{`${readAble(btnValue as number, 1)}/${props.maximumValue}`}</Text>}
                {...props}
                onSlidingStart={(event, index: number) => {
                    props.onSlidingStart?.(event, index);
                    state.sliding = true;
                }}
                onTouchStart={e => {
                    globalData.panEnabled = false;
                }}
                onTouchEnd={e => {
                    globalData.panEnabled = true;
                }}
                value={state.value}
                containerStyle={{ ...props.containerStyle, flex: 1, width: "100%" }}
                onSlidingComplete={onChange} />
            <Button css={x => x.cls("_sliderButton").joinRight(props.buttonCss)}
                icon={<Icon type="AntDesign" size={15} color="white" name="plus" />}
                ifTrue={props.enableButtons && btnValue != undefined}
                onPressIn={() => state.sliding = true}
                whilePressed={plus} onPress={plus}></Button>
        </View>)
}
