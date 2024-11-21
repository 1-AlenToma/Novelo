import { Icon } from "./Icon";
import { View, AnimatedView, Text, TouchableOpacity, ScrollView } from "./ReactNativeComponents";
import { InternalThemeContext, globalData } from "../theme/ThemeContext";
import { useAnimate, useTimer } from "../hooks";
import StateBuilder from "react-smart-state";
import { Platform } from "react-native";
import { ifSelector, newId, optionalStyle, proc } from "../config";
import * as React from "react";
import { PortalProps } from "../Typse";

export const Portal = (props: PortalProps) => {
    const state = StateBuilder({
        id: newId()
    }).build();
    const context = React.useContext(InternalThemeContext);


    React.useEffect(() => {
        let fn = ifSelector(props.ifTrue) !== false ? context.add.bind(context) : context.remove.bind(context);
        fn(state.id, (
            <View key={state.id} css={`zi:1 ${optionalStyle(props.css).c}`} style={props.style}>
                {props.children}
            </View>
        ), true);

        return () => context.remove(state.id);
    })


    return null;

}