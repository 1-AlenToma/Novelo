import { View, Modal, Icon, Text, DropdownItem, TouchableOpacity } from "./ReactNativeComponents";
import ItemList from "./ItemList";
import TextInput from "./TextInputView";
import { useTimer } from "hooks";
import { time } from "console";

export const DropDownLocalList = ({ items, visible, selectedValue, css, size, render, onSelect, enableSearch }: {
    items: DropdownItem[],
    visible?: boolean,
    selectedValue?: any,
    onSelect: (item: DropdownItem) => boolean | void | Promise<boolean | void>,
    css?: string,
    size?: number | string,
    render?: (item: DropdownItem) => JSX.Element,
    enableSearch?: ((text: string) => DropdownItem[]) | boolean,
}) => {
    const state = buildState({
        visible: visible ?? false,
        items: items,
    }).ignore("items").build();
    const timer = useTimer(100);

    useEffect(() => {
        if (state.visible !== visible && visible !== undefined) {
            state.visible = visible;
        }
    }, [visible]);

    const selectedItem = items.find(item => item.value === selectedValue);
    const selectedIndex = items.findIndex(item => item.value === selectedValue);

    return (
        <TouchableOpacity css={`bor-5 boc-#333 bow-0.5 wi-100% pal-5 juc-center he-30 ${css ?? ""}`} onPress={() => state.visible = !state.visible}>
            <Text css="maw-80%">{selectedItem?.label}</Text>
            <Icon name="chevron-down-circle-sharp" css={"_abc ri-5 invert"} type="Ionicons" size={20} />
            <Modal
                css={`he-${size ?? 200} pab-15`}
                isVisible={state.visible}
                addCloser={true}
                onHide={() => state.visible = false}>
                <View css="bac-transparent mat-15 fl-1 wi-100% he-100% mih-100 pal-5 pab-15">
                    <View css="wi-95% he-50 bac-transparent" ifTrue={enableSearch !== undefined && enableSearch !== false}>
                        <TextInput
                            serachBar={true}
                            disableFullscreenUI={true}
                            enterKeyHint="search"
                            inputMode="search"
                            onChangeText={(txt) => {
                                timer(() => {
                                    if (typeof enableSearch === "function") {
                                        state.items = enableSearch(txt);
                                    } else
                                        state.items = items.filter(item => item.label.toLowerCase().includes(txt.toLowerCase()));
                                });
                            }}
                            placeholder="Search..."
                            style={{ width: "100%", height: "70%" }}
                            css="he:90% clearwidth bow:1 bor:3 desc fos:14 boc:#ccc pal:10"
                        />
                    </View>
                    <ItemList
                        vMode={true}
                        items={state.items}
                        selectedIndex={selectedIndex}
                        itemCss={(item) => {
                            return `wi-100% he-40 bobw-0.5 boc-#333 DropDownListItem invert ${item.value === selectedValue ? "selectedValue" : ""}`;
                        }}
                        container={(({ item }) => {
                            if (render) {
                                return render(item);
                            }
                            return (
                                <View css={`ali:center bac:transparent pal:10 bor:5 flex row juc:space-between mih:24 clb`}>
                                    <Text css={`desc fos:13`}>{item.label}</Text>
                                </View>
                            )
                        })}
                        onPress={async (item) => {
                            if (await onSelect(item) === false) {
                                state.visible = false;
                            }
                        }}
                    />
                </View>
            </Modal>
        </TouchableOpacity>
    )

}
