import { TextInput } from "react-native";
import * as React from "react";
import Icon from "./Icons";
import {
  removeProps,
  parseThemeStyle,
  StyledView
} from "../Methods";
import Modal from "./Modal";
import TouchableOpacity from "./TouchableOpacityView";
import View from "./ThemeView";
import Text from "./ThemeText";
const Input = StyledView(TextInput, "TextInput");
export default React.forwardRef(
  (
    {
      style,
      invertColor,
      css,
      isModole,
      inputVisible,
      ...props
    }: any,
    ref
  ) => {
    if (methods.ifSelector(props.ifTrue) === false)
        return null;
    const inputRef = React.useRef();
    const [visible, setVisible] = React.useState(inputVisible || false);
    const [size, setSize] = React.useState();
    const [txt, setTxt] = React.useState(
      props.defaultValue
    );
    let st = parseThemeStyle(
      style,
      css,
      invertColor
    );
    if (props.multiline)
      st.push({ textAlignVertical: "top" });

    if (isModole) {
      return (
        <View css="flex">
          <Modal
            blur={false}
            visible={visible}
            onHide={() => setVisible(false)}
            height="80">
            <View css="flex mat:20">
              <TouchableOpacity
                css="listButton bow:1 boc:#ccc juc:center ali:center mab:10"
                onPress={() => {
                  props.onChangeText(txt);
                  setVisible(false);
                }}>
                <Text invertColor={true}>
                  Save
                </Text>
              </TouchableOpacity>
              <Input
                ref={ref}
                disableFullscreenUI={true}
                inputMode="search"
                placeholderTextColor={st.firstOrDefault(
                  "color"
                )}
                {...props}
                onChangeText={t => setTxt(t)}
                style={[
                  ...st,
                  { flex: 1 }
                ]}
              />
            </View>
          </Modal>
          <TouchableOpacity
            ifTrue={()=> inputVisible != true}
            onPress={() => setVisible(true)}>
            <Input
              disableFullscreenUI={true}
              inputMode="search"
              placeholderTextColor={st.firstOrDefault(
                "color"
              )}
              {...props}
              readOnly={true}
              style={st}
            />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View
        style={{
          flex: props.multiline ? 1 : undefined
        }}
        onLayout={e => {
          if (e.nativeEvent.layout.height) {
            setSize(e.nativeEvent.layout);
          }
        }}
        css="wi:100% ali:center">
        <Input
          ref={c => {
            if (ref) {
              if (typeof ref === "function")
                ref(c);
              else ref.current = c;
            }
            inputRef.current = c;
          }}
          disableFullscreenUI={true}
          inputMode="search"
          placeholderTextColor={st.firstOrDefault(
            "color"
          )}
          {...props}
          style={[
            {
              width: props.multiline
                ? "100%"
                : undefined
            },
            ...st
          ]}
        />
        <TouchableOpacity
          style={{
            marginTop:
              ((size?.height ?? 1) - 24) / 2
          }}
          css="absolute ri:5"
          ifTrue={() =>
            props.value?.has() ||
            props.defaultValue?.has()
          }
          onPress={() => {
            inputRef.current.clear();
            inputRef.current.focus();
            props.onChangeText?.("");
            props.onSubmitEditing?.("");
          }}>
          <Icon
            invertColor={invertColor}
            css="bold"
            type="AntDesign"
            name="close"
            size={24}
          />
        </TouchableOpacity>
      </View>
    );
  }
);
