import { TouchableOpacity, Text, View } from "./ReactNativeComponents";
import * as React from "react";
import { ButtonProps } from "../Typse";
import { ifSelector, optionalStyle, RemoveProps } from "../config";
import { useTimer } from "../hooks";

export const Button = (props: ButtonProps) => {
    const [shadow, setShadow] = React.useState("sh-sm");
    const disabled = ifSelector(props.disabled);
    const timer = useTimer(props.whilePressedDelay ?? 300);
    const pressableProps = { ...props };
    const onPress = (event: any) => {
        timer.clear();
        event.preventDefault();
        event.stopPropagation();
        props.onPress(event);
    }

    const onLongPress = (event: any) => {
        props.onLongPress?.(event);
        const fn = () => {
            props.whilePressed();
            timer(fn);
        }
        fn();
    }

    const onPressOut = (event) => {
        props.onPressOut?.(event);
        timer.clear();
    }

    if (disabled === true) {
        RemoveProps(pressableProps, "onPress", "onLongPress", "onPressIn", "onPressOut");
        pressableProps.activeOpacity = 0.5;
    } else if (props.whilePressed) {
        delete pressableProps.whilePressed;
        pressableProps.onPress = onPress;
        pressableProps.onLongPress = onLongPress;
        pressableProps.onPressOut = onPressOut;
    }

    const onMouseEnter = (event: any) => {
        setShadow("sh-md")
        props.onMouseEnter?.(event)
    }

    const onMouseLeave = (event: any) => {
        setShadow("sh-sm");
        props.onMouseLeave?.(event);
    }



    return (
        <TouchableOpacity {...pressableProps}
            onMouseLeave={onMouseLeave} onMouseEnter={onMouseEnter} css={x => x.cls(shadow, "_button button").joinRight(props.css).if(disabled, x => x.cls("disabled"))}>
            {props.icon}
            <Text ifTrue={props.text != undefined} css={x => x.cls("fos-xs").joinRight(props.textCss)}>{props.text}</Text>
        </TouchableOpacity>
    )

}