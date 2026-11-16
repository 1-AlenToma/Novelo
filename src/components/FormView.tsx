import * as React from "react";
import { View, Text } from "react-native-short-style/mems";

export const FormView = ({ title, children, desc }: { title?: string, desc?: string, children: any }) => {

    return (<View css="formView">
        <Text ifTrue={title != undefined} css="header">
            {title}
        </Text>
        <Text ifTrue={desc != undefined} css="desc">
            {desc}
        </Text>
        {children}
    </View>)

}