
import { View, AnimatedView, Text, TouchableOpacity, ScrollView } from "./ReactNativeComponents";
import * as React from "react";
import {
    useAnimate
} from "../hooks";
import { ifSelector, optionalStyle, proc, readAble } from "../config";
import { ProgressBarProps, Size } from "../Typse";
import { Blur } from "./Blur";


export const ProgressBar = ({
    value,
    ifTrue,
    color,
    speed,
    css,
    style,
    children
}: ProgressBarProps) => {
    const [size, setSize] = React.useState<Size>();
    const { animate, animateX } = useAnimate({
        speed: speed ?? 50
    });
    const applyProc = () => {
        if (size)
            animateX(
                Math.round(
                    proc(
                        Math.round(value * 100),
                        size.width
                    )
                )
            );
    };
    React.useEffect(() => {
        applyProc();
    }, [value]);

    React.useEffect(() => {
        applyProc();
    }, [size]);

    let bound: number[] = [];
    for (let i = 0; i <= 100; i++) {
        bound.push(
            Math.round(
                proc(i, size?.width ?? 100)
            )
        );
    }

    return (
        <View
            ifTrue={ifTrue}
            onLayout={e => {
                setSize(e.nativeEvent.layout);
            }}
            style={style}
            css={x => x.cls("_progressBar").joinRight(css)}>
            <Blur css="zi:1" />
            <View
                css="zi:3 bac:transparent wi-100% juc-center ali-center fld-row">
                {children}
            </View>
            <AnimatedView
                css="_progressBarAnimatedView"
                style={{
                    backgroundColor: color ?? "green",
                    transform: [
                        {
                            translateX: animate.x.interpolate({
                                inputRange: bound,
                                outputRange: bound,
                                extrapolate: "clamp"
                            })
                        }
                    ]
                }}
            />
        </View>
    );
};
