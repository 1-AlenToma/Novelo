import * as React from "react";
import { AnimatedView, TouchableOpacity, View, Text, ScrollView, TextInput } from "./ReactNativeComponents";
import { InternalThemeContext } from "../theme/ThemeContext";
import { useAnimate } from "../hooks";
import StateBuilder from "react-smart-state";
import { ViewStyle } from "react-native";
import { ifSelector, newId, optionalStyle, setRef } from "../config";
import { DropdownItem, DropdownListProps, DropdownRefItem, ModalProps, Size } from "../Typse";
import { Modal } from "./Modal";
import { ActionSheet } from "./ActionSheet";
import { Icon } from "./Icon";
import * as ReactNtive from "react-native";
import { FormItem } from "./FormGroup";
import { TabBar, TabView } from "./TabBar";

const DropDownItemController = ({ item, index, state, props }: { props: DropdownListProps, item: DropdownItem, index: number, state: any }) => {
    const itemState = StateBuilder({
        selected: undefined as any
    }).ignore("selected").build();
    if (!(state.text == "" || props.onSearch?.(item, state.text) || item.label.toLowerCase().indexOf(state.text.toLowerCase()) != -1))
        return null

    return (
        <TouchableOpacity onPress={() => {
            state.selectedValue = item.value;
            props.onSelect?.(item);
            state.visible = false;
        }} onMouseEnter={() => itemState.selected = index}
            onMouseLeave={() => itemState.selected = undefined}
            css={`mih:30 pa:5 wi:100% juc:center bobw:.5 boc:#CCC DropDownListItem ${item.value === state.selectedValue || index == itemState.selected ? props.selectedItemCss ?? "_selectedValue" : ""}`}>
            {
                props.render ? props.render(item) : (
                    <Text css={`fos-sm ${item.value === state.selectedValue || index == itemState.selected ? props.selectedItemCss ?? "_selectedValue" : ""}`}>{item.label}</Text>
                )
            }
        </TouchableOpacity>
    )
}

export const DropdownList = React.forwardRef<DropdownRefItem, DropdownListProps>((props, ref) => {

    const state = StateBuilder({
        visible: false,
        shadow: "",
        text: "",
        index: 0,
        selectedValue: props.selectedValue,
        propsSize: undefined as Size | undefined,
        refItems: {
            scrollView: undefined as typeof ScrollView | undefined
        }
    }).ignore("refItems.scrollView").build();
    const mode = props.mode ?? "Modal";

    state.useEffect(() => {
        if (state.refItems.scrollView) {
            state.refItems.scrollView.scrollTo({
                y: props.items.findIndex(x => x.value == props.selectedValue) * 30,
                animated: false
            })
        }
    }, "refItems.scrollView")

    state.useEffect(() => {
        if (!state.visible && state.text != "")
            state.text = "";
    }, "visible")

    React.useEffect(() => {
        if (state.selectedValue != props.selectedValue)
            state.selectedValue = props.selectedValue;
    }, [props.selectedValue])

    setRef(ref, {
        open: () => state.visible = true,
        close: () => state.visible = false,
        selectedValue: state.selectedValue
    } as DropdownRefItem);


    const Component = mode == "Modal" ? Modal : mode == "ActionSheet" ? ActionSheet : TabView;
    const selectedText = props.items.find(x => x.value == state.selectedValue)?.label;
    let componentsProps: any = { css: `he:${props.size ?? "50%"} DropDownListItems`, addCloser: true, size: props.size ?? "50%", isVisible: state.visible, onHide: () => state.visible = false }
    if (mode == "Fold") {
        componentsProps = {
        }
    }

    const Container: any = mode == "Fold" ? TabBar : React.Fragment;
    const Selector = mode == "Fold" ? TabView : React.Fragment;
    const containerProps = mode == "Fold" ? {
        disableScrolling: true,
        onTabChange: (index) => state.index = index,
        style: { flex: null, flexBasis: state.index == 1 ? undefined : 38 },
        selectedTabIndex: state.visible ? 1 : 0,
        css: props.css
    } : {};

    if (ifSelector(props.ifTrue) == false)
        return null;
    return (
        <Container {...containerProps}>
            <Selector>
                <TouchableOpacity onLayout={({ nativeEvent }) => {
                    state.propsSize = nativeEvent.layout;
                }} onMouseEnter={() => state.shadow = "sh-sm"}
                    onMouseLeave={() => state.shadow = ""}
                    onPress={() => state.visible = !state.visible}
                    css={`wi:95% he:30 fld:row ali:center bow:.5 bor:5 _overflow boc:#CCC DropdownList ${state.shadow} ${optionalStyle(props.css).c}`}>
                    <View css="fl:1 wi:85% he:100% borw:.5 juc:center pal:5 boc:#CCC bac-transparent">
                        <Text style={selectedText ? undefined : {
                            color: "#CCC"
                        }} css="fos-sm">{selectedText ?? props.placeHolder}</Text>
                    </View>
                    <View css="fl:1 _center wi:30 maw:30 he:100% bac-transparent">
                        <Icon style={{
                            transform: [{
                                rotateX: (mode == "Fold" ? "0deg" : (state.visible ? "180deg" : "0deg"))
                            }]
                        }} type="AntDesign" name={mode == "Fold" ? "caretright" : "caretdown"} />
                    </View>
                </TouchableOpacity>
            </Selector>
            <Component {...componentsProps}>
                <Text css="fos-lg fow:bold co:#CCC mab:5" ifTrue={props.placeHolder != undefined}>{props.placeHolder}</Text>
                <FormItem css="mat-10" ifTrue={props.enableSearch == true} labelPosition="Left"
                    icon={{ type: "Ionicons", name: "search", css: "co:#CCC" }}>
                    <TextInput
                        css="mab:5 pa:5 bow:.5 boc:#CCC"
                        placeholderTextColor={"#CCC"}
                        placeholder={props.textInputPlaceHolder ?? "Search here..."}
                        defaultValue={state.text}
                        onChangeText={txt => state.text = txt} />
                </FormItem>
                <ScrollView nestedScrollEnabled={true} style={{ marginTop: !props.enableSearch ? 15 : 5, maxHeight: mode == "Fold" ? Math.min(props.items.length * (35), 200) - (props.items.length > 10 ? state.propsSize?.height ?? 0 : 0) - 10 : undefined }} ref={c => state.refItems.scrollView = c as any}>
                    {
                        props.items.map((x, index) => (<DropDownItemController key={index} item={x} index={index} props={props} state={state} />))
                    }
                </ScrollView>
            </Component>
        </Container>
    )

});