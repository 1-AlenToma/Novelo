import * as React from "react";
import { View, Text } from "./ReactNativeComponents";
import { FormGroupProps, FormItemProps } from "../Typse";
import { ifSelector } from "../config";
import { Icon } from "./Icon";
import { ToolTip } from "./ToolTip";

const ForGroupContext = React.createContext<{ labelPosition: string }>({} as any)

export const FormItem = (props: FormItemProps) => {
    const context = React.useContext(ForGroupContext);
    const labelPosition = props.labelPosition ?? context.labelPosition ?? "Top";
    if (ifSelector(props.ifTrue) == false)
        return null;

    const icon: any = props.icon;
    const css = "mar:5";

    return (
        <View style={props.style} css={x => x.cls("_formItem", "FormItem").joinRight(props.css)}>
            <View css={x => x.flD(labelPosition == "Top" ? "column" : "row").if(labelPosition == "Top", "ali-flex-start", "ali-center juc-space-between")}>
                <View css="fld-row">
                    <View ifTrue={icon != undefined} css={css}>
                        {icon && icon.type ? <Icon size={15} color={"white"} {...icon} /> : icon}
                    </View>
                    <View ifTrue={props.title != undefined} css={css}>
                        {props.title && typeof props.title == "string" ? <Text css="fos-sm fow:bold">{props.title}</Text> : props.title}
                    </View>
                    <ToolTip postion="Top" containerStyle={"po:relative le:1"} ifTrue={props.info != undefined && labelPosition == "Top"} text={props.info}>
                        <Icon type="AntDesign" name="infocirlce" size={15} />
                    </ToolTip>
                </View>
                <View css={x => x.cls("_formItemCenter", "_formItemCenter" + labelPosition).if(labelPosition == "Top", x => x.wi("100%"))}>
                    {props.children}
                </View>
                <ToolTip postion="Top" containerStyle={"po:relative le:1"} ifTrue={props.info != undefined && labelPosition != "Top"} text={props.info}>
                    <Icon type="AntDesign" name="infocirlce" size={15} />
                </ToolTip>
            </View>
            <View ifTrue={props.message != undefined} css="fl:1 pal:10 pab:5">
                {props.message}
            </View>

        </View>
    )
}


export const FormGroup = (props: FormGroupProps & { children: (React.ReactElement<FormItemProps> | React.ReactElement<FormItemProps>[]) }) => {

    return (
        <ForGroupContext.Provider value={{ labelPosition: props.labelPosition }}>
            <View style={props.style} css={x => x.cls("_formGroup FormGroup").maT(30).joinRight(props.css)}>
                <View ifTrue={props.title != undefined && props.formStyle == "Headless"} css="headerLine bac-transparent">
                    <View css="bac-transparent">
                        <Text numberOfLines={1}>{props.title}</Text>
                    </View>
                </View>
                <View css="bac-transparent">
                    <View css="bac-transparent">
                        <View ifTrue={props.title != undefined && props.formStyle != "Headless"}
                            css="wi-100% fl-0 flg-1 pa-5 header bac-transparent">
                            <Text numberOfLines={1}>{props.title}</Text>
                        </View>
                        <View css={x => x.maT(8).fillView().flG(1).paL(5).paR(5).baC("$co-transparent")}>
                            {
                                props.children
                            }
                        </View>
                    </View>
                </View>
            </View>
        </ForGroupContext.Provider>
    )

}


