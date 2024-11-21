import * as React from "react";
import * as Icons from "@expo/vector-icons";
import { IConProps } from "../Typse";
import { CreateView, View } from "./ReactNativeComponents";
import { useTimer } from "../hooks";
import { flatStyle } from "../config";

let styledItems = {};
export const Icon = (props: IConProps) => {
    const [flash, setFlash] = React.useState<any>(undefined);
    const timer = useTimer(1000);
    let TypeIcon = Icons[props.type]
    TypeIcon.displayName = props.type;
    let Ico: (props: IConProps) => React.ReactNode = styledItems[props.type] ?? (styledItems[props.type] = CreateView<any, any>(TypeIcon, "Icon"));
    if (props.flash)
        timer(() => {
            if (flash != props.flash)
                setFlash(props.flash)
            else setFlash(props.color)
        })

    let stl: any = flatStyle(props.style);
    if (flash)
        stl.color = flash;
    return (
        <Ico {...props} style={stl} />
    );
};