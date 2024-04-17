import Modal from "./Modal";
import ActionSheet from "./ActionSheet";
import ItemList from "./ItemList";
import { useState } from "react";
import View from "./ThemeView";
import TextInput from "./TextInputView";
import Text from "./ThemeText";
import Icon from "./Icons";
import TouchableOpacity from "./TouchableOpacityView";

export default ({
  items,
  selectedValue,
  onSelect,
  type,
  render,
  textKey,
  selectedIndex,
  updater,
  hooks,
  disableInput,
  onSearch,
  invertColor,
  ...props
}: any) => {
  let [visible, setVisible] = useState(false);
  let [txt, setTxt] = useState("");
  let Component =
    type === "ActionSheet" ? ActionSheet : Modal;
  const search = (item: any) => {
    if (typeof item === "string") return item;
    if (textKey) return item[textKey];
    if (item.text) return item.text;

    return item.name;
  };
  return (
    <>
      <View css="flex bow:1 boc:#ccc he:24 overflow">
        <TouchableOpacity
          css="flex juc:space-between row ali:center par:5"
          onPress={() => {
            setVisible(true);
          }}>
          <Text
            numberOfLines={1}
            invertColor={
              invertColor == undefined
                ? true
                : invertColor
            }
            css="desc fos:12 pal:10 maw:80% overflow">
            {selectedValue?.replace(
              /\-|\_/g,
              " "
            )}
          </Text>
          <Icon
            invertColor={
              invertColor == undefined
                ? true
                : invertColor
            }
            type="AntDesign"
            size={16}
            name={
              visible ? "caretup" : "caretdown"
            }
          />
        </TouchableOpacity>
      </View>
      <Component
        {...props}
        blur={false}
        visible={visible}
        onHide={() => setVisible(false)}>
        <View
          css="juc:flex-start clearboth ali:center he:30 mab:10 mat:10"
          ifTrue={
            disableInput === true ||
            items === undefined ||
            items.length < 10
              ? false
              : disableInput
          }>
          <TextInput
            onChangeText={setTxt}
            invertColor={false}
            css="wi:90% pa:5 bor:2"
            defaultValue={txt}
            placeholder="Search for chapter"
          />
        </View>
        <ItemList
          hooks={hooks}
          updater={updater}
          selectedIndex={selectedIndex}
          css="flex"
          onPress={async item => {
            await setVisible(false);
            onSelect(item);
          }}
          items={items?.filter(
            x =>
              txt == "" ||
              (search(x) || "").has(txt) ||
              onSearch?.(x, txt)
          )}
          container={({ item }) => render(item)}
          itemCss="pa:5 clearwidth bobw:1 boc:gray"
          vMode={true}
        />
      </Component>
    </>
  );
};
