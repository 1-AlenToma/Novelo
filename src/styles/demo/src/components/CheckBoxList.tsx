import * as React from "react";
import StateBuilder from "react-smart-state";
import { CheckBoxListProps, CheckBoxProps } from "../Typse";
import { FormGroup } from "./FormGroup";
import { View, Text, TouchableOpacity, AnimatedView } from "./ReactNativeComponents";
import { ifSelector, newId, optionalStyle } from "../config";
import { Icon } from "./Icon";
import { useAnimate } from "../hooks";
type CheckBoxListContext = {
    onChange: (checked: boolean, id: string) => void;
    add: (id: string, checked: boolean) => boolean;
    remove: (id: string) => void;
    checkBoxListProps: CheckBoxListProps;
    value: (id: string) => boolean;
    ids: Map<string, boolean>;
}

const CheckBoxContext = React.createContext<CheckBoxListContext>({
    checkBoxListProps: {} as any
} as any);



export const CheckBoxList = (props: CheckBoxListProps) => {
    if (ifSelector(props.ifTrue) == false)
        return null;
    const state = StateBuilder({
        ids: new Map(),
        isInit: false,
        working: false
    }).build();

    let ViewItem = props.label ? FormGroup : View;
    const reset = (lastId: string, value: boolean) => {
        if (props.selectionType == "CheckBox" || !state.isInit)
            return;
        state.working = true;
        let keys = [...state.ids.keys()];
        let update = false;
        for (let key of keys) {
            if (key !== lastId) {
                if (state.ids.get(key) !== false)
                    update = true;
                state.ids.set(key, false);
            }
        }

        if (update) {
            state.ids = (new Map([...state.ids.entries()]))
        }
        state.working = false;
    }

    React.useEffect(() => {
        state.isInit = true;
    }, [])


    const contextValue: CheckBoxListContext = {
        onChange: (checked: boolean, id: string) => {
            if (state.working || !state.ids.has(id))
                return;
            let cValue = state.ids.get(id);
            contextValue.add(id, checked);
            let keys = [...state.ids.keys()];
            reset(id, checked);
            if (cValue != checked)
                props.onChange(keys.map((x, i) => {
                    return { checked: state.ids.get(x), checkBoxIndex: i }
                }));
        },
        add: (id: string, checked: boolean) => {
            state.ids.set(id, checked)
            return checked;
        },
        remove: (id: string) => {
            state.ids.delete(id);
        },
        checkBoxListProps: props,
        value: (id: string) => state.ids.get(id) ?? false,
        ids: state.ids
    }

    React.useEffect(() => {
        state.ids = new Map()
    }, [props.children])

    let items = Array.isArray(props.children) ? props.children : [props.children];

    return (
        <CheckBoxContext.Provider value={contextValue}>
            <ViewItem title={props.label} {...props}>
                {
                    items.map((x, i) => (
                        <View key={i}>
                            {x as any}
                        </View>
                    ))
                }
            </ViewItem>
        </CheckBoxContext.Provider>
    )
}

export const CheckBox = (props: Omit<CheckBoxProps, "selectionType">) => {
    const state = StateBuilder({
        id: newId(),
        checked: props.checked,
        isInit: false,
        refItem: {
            working: false,
            prev: props.checked,
        }
    }).ignore("refItem").build();

    const context = React.useContext<CheckBoxListContext>(CheckBoxContext);
    const checkBoxType = context.checkBoxListProps.checkBoxType ?? props.checkBoxType ?? "CheckBox";
    const labelPostion = props.labelPostion ?? context.checkBoxListProps.labelPostion ?? "Right";
    const disabled = context.checkBoxListProps.disabled ?? props.disabled ?? false;
    const selectionType = context.checkBoxListProps.selectionType;
    const { animateX, animate, currentValue } = useAnimate({ speed: 100 });
    const swtichColor: any = context.checkBoxListProps.swtichColor ?? props.swtichColor ?? { true: "black", false: "white" }
    if (!context.ids || !context.ids.has(state.id))
        context.add?.(state.id, props.checked);
    const tAnimate = (value: number) => {

        let ch = value == 1 ? true : false;
        if ((state.refItem.working && state.refItem.prev == ch) || disabled)
            return;
        state.refItem.working = true;
        state.refItem.prev = ch;
        animateX(
            value,
            () => {
                state.refItem.working = false;
            },
        );
    };



    React.useEffect(() => {
        state.isInit = true;
        return () => context.remove?.(state.id)
    }, [])

    if (!context.value)
        React.useEffect(() => {
            if (checkBoxType == "Switch")
                tAnimate(state.checked ? 1 : 0)
            //if (props.checked !== state.checked)
            state.checked = props.checked
        }, [props.checked])

    React.useEffect(() => {
        let isChecked = context.value != undefined ? context.value(state.id) : props.checked;
        if (checkBoxType == "Switch")
            tAnimate(state.checked ? 1 : 0)
        if (state.checked != isChecked && state.isInit) {
            //context.add?.(state.id, state.checked);
            (context.onChange ?? props.onChange)?.(state.checked, state.id);
        }
    }, [state.checked])

    if (context.ids)
        React.useEffect(() => {
            if (state.checked !== context.value(state.id)) {
                state.checked = (context.value(state.id))
            }
        }, [context.ids])
    const color = (isChecked: boolean) => {
        return swtichColor[isChecked as any]
    }
    const activeOpacity = disabled ? .5 : 1;
    const disabledCss = disabled ? "disabled" : "";

    return (
        <>
            <TouchableOpacity activeOpacity={activeOpacity} style={props.style} css={`_checkBox _overflow juc:end mab:5 CheckBox ${optionalStyle(props.css).c} ${disabledCss}`}
                ifTrue={checkBoxType == "CheckBox"}
                onPress={() => {
                    if (!disabled && !props.onPress)
                        state.checked = !state.checked;
                    props.onPress?.();
                }}>
                <Text ifTrue={props.label != undefined && labelPostion == "Left"} css="fos-sm">{props.label}</Text>
                <View style={{ backgroundColor: color(state.checked) }} css={`_checkBox_${labelPostion}`} >
                    <Icon ifTrue={state.checked} type="AntDesign" css={x => x.co("$co-light")} name="check" size={24} />
                </View>
                <Text ifTrue={props.label != undefined && labelPostion == "Right"} css="fos-sm">{props.label}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={props.style}
                css={x => x.cls("_checkBox").juC("flex-end").maB(5).joinRight(props.css).cls(disabledCss)}
                ifTrue={checkBoxType == "RadioButton"}
                onPress={() => {
                    if ((!state.checked || selectionType == "CheckBox" || !context.ids) && !disabled)
                        state.checked = !state.checked
                }}>
                <Text ifTrue={props.label != undefined && labelPostion == "Left"} css="fos-sm">{props.label}</Text>
                <View style={{ borderRadius: 24, backgroundColor: "transparent" }} css={`_checkBox_${labelPostion}`}>
                    <Icon ifTrue={state.checked} size={21} type="MaterialCommunityIcons" name="checkbox-blank-circle" color={color(true)} />
                </View>
                <Text ifTrue={props.label != undefined && labelPostion == "Right"} css="fos-sm">{props.label}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                ifTrue={checkBoxType == "Switch"}
                activeOpacity={activeOpacity}
                onPress={() => {
                    if (!disabled)
                        state.checked = (!state.checked);
                }}
                style={props.style} css={`fld:row ali:center juc:end ${optionalStyle(props.css).c} ${disabledCss}`}>
                <Text
                    ifTrue={props.label != undefined}
                    css="fos-sm"
                    style={{
                        flexGrow: 1,
                        maxWidth: "80%",
                        overflow: "hidden"
                    }}>
                    {props.label}
                </Text>
                <View style={{
                    backgroundColor: color(state.checked)
                }} css="bor:10 mab:5 sh-xs juc:center miw:60 he:25 overflow:visible">
                    <AnimatedView
                        style={{
                            backgroundColor: color(!state.checked),
                            transform: [
                                {
                                    translateX:
                                        animate.x.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-5, 40],
                                            extrapolate: "clamp"
                                        })
                                }
                            ]
                        }}
                        css="wi:25 sh-sm he:25 bor:20 overflow:visible">
                    </AnimatedView>
                </View>
            </TouchableOpacity>
        </>
    )
}