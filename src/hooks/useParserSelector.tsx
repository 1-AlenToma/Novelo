import { Modal, View, Text, ScrollView, CheckBox, CheckBoxList } from "react-native-short-style";
import * as React from "react";


export const useParserSelector = (onDone: () => void) => {
    const state = buildState(() =>
    ({
        selectedParser: context.parser.all.map(x => ({ name: x.name, selected: false })),
        visible: false,
        clear: () => {
            state.selectedParser.forEach(x => x.selected = false);
            state.selectedParser = [...state.selectedParser];
        },
        hasSelection: () => state.selectedParser.some(x => x.selected)
    })).ignore("selectedParser").build();



    let elem = (
        <>
            <CheckBox css={"invert"} label="Global Search" onPress={() => {
                if (state.hasSelection())
                    state.clear();
                else state.visible = true;
            }} checked={state.hasSelection()} />
            <Modal isVisible={state.visible} addCloser={true} css={"he-60%"} onHide={() => {
                state.visible = false;
                onDone();
            }}>
                <View css="mat-15 fl-1 invert">
                    <Text css="header fow-bold">Select Parsers</Text>
                    <ScrollView>
                        <CheckBoxList selectionType="CheckBox" css="invert" onChange={(items) => items.forEach(x => state.selectedParser[x.checkBoxIndex].selected = x.checked)}>
                            {
                                state.selectedParser.map((x, index) => (
                                    <CheckBox css="invert" checked={x.selected} label={x.name} key={index} labelPostion="Right" />
                                ))
                            }
                        </CheckBoxList>
                    </ScrollView>

                </View>
            </Modal>
        </>)

    return { ...state, elem }
}