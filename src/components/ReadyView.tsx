import * as React from "react";
import { View } from "react-native"


export const ReadyView = ({ children }) => {
    const state = buildState(() => ({
        size: undefined as any
    })).timeout(5).build();



    return (<View style={{ flex: 1, width: "100%", height: "100%", }} onLayout={({ nativeEvent }) => {
        state.size = nativeEvent.layout.height;
    }}>
        {!state.size ? null : children}
    </View>)
}