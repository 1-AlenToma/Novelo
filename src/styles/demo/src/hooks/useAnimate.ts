import * as React from "react";

import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    Easing,
    PanResponder
} from "react-native";

export const useAnimate = ({
    y,
    x,
    speed,
    easing,
    delay,
    useNativeDriver = Platform.OS != "web"
}: any = {}) => {
    const currentValue = React.useRef({
        x: undefined,
        y: undefined
    }).current;
    const animate = React.useRef(
        new Animated.ValueXY({
            y: y ?? 0,
            x: x ?? 0
        })
    ).current;

    const animating = React.useRef<any>({ x: undefined, y: undefined, isAnimating: false }).current;
    const animateY = (
        value: any,
        onFinished?: Function,
        sp?: any
    ) => {
        if (animate.y == currentValue.y)
            return;
        currentValue.y = value;
        run(
            value,
            animate.y,
            "y",
            () => {
                animate.y.setValue(value);
                animate.y.flattenOffset();
                onFinished?.();
            },
            sp
        );
    };

    const animateX = (
        value: any,
        onFinished?: Function,
        sp?: any
    ) => {
        if (value == currentValue.x) {
            return;
        }
        currentValue.x = value;
        run(
            value,
            animate.x,
            "x",
            () => {
                animate.x.setValue(value);
                animate.x.flattenOffset();
                onFinished?.();
            },
            sp
        );
    };


    const run = (
        value: any,
        animObject: any,
        key: "x" | "y",
        onFinished?: Function,
        sp?: any,

    ) => {
        try {
            animating.isAnimating = true;
            animating[key]?.stop?.();
            animating[key] = Animated.timing(
                animObject,
                {
                    toValue: value,
                    duration: sp ?? speed ?? 300,
                    easing: easing ?? Easing.linear,
                    delay,
                    useNativeDriver: useNativeDriver
                }
            );
            animating[key].start(() => {
                animating.isAnimating = false;
                onFinished?.();
            });
        } catch (e) {
            console.error("animObject", e)
        }
    };

    return {
        animateY,
        animateX,
        run,
        animate,
        currentValue,
        animating
    };
};