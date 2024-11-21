import * as React from "react";
import {
  removeProps,
  StyledView
} from "../Methods";
import { View, AnimatedView, Text, TouchableOpacity, Icon, Modal, TextInput } from "./ReactNativeComponents";
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

    const inputRef = React.useRef();
    const [visible, setVisible] = React.useState(inputVisible || false);
    const [size, setSize] = React.useState();
    const [txt, setTxt] = React.useState(
      props.defaultValue
    );

    if (methods.ifSelector(props.ifTrue) === false)
      return null;

    if (isModole) {
      return (
        <View css="flg-1 width-100% he-100%">
          <Modal
            addCloser={true}
            disableBlurClick={false}
            isVisible={visible}
            onHide={() => setVisible(false)}
            css="he-80%">
            <View css="flex mat:20">
              <TouchableOpacity
                css="listButton bow:1 boc:#ccc juc:center ali:center mab:10 invert"
                onPress={() => {
                  props.onChangeText(txt);
                  setVisible(false);
                }}>
                <Text css={"invertco"}>
                  Save
                </Text>
              </TouchableOpacity>
              <TextInput
                ref={ref}
                disableFullscreenUI={true}
                inputMode="search"
                {...props}
                onChangeText={t => setTxt(t)}
                style={[style, { flex: 1, textAlignVertical: props.multiline ? "top" : undefined }]}
              />
            </View>
          </Modal>
          <TouchableOpacity
            ifTrue={() => inputVisible != true}
            onPress={() => setVisible(true)} css="fl-1">
            <TextInput
              disableFullscreenUI={true}
              inputMode="search"
              {...props}
              css={css}
              readOnly={true}
              style={[style, { flexGrow: 1, width: 200, textAlignVertical: props.multiline ? "top" : undefined }]}
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
        css={`wi:100% ali:center fl-1 juc-center he-100%`}>
        <TextInput
          onLayout={e => {
            setSize(e.nativeEvent.layout);
          }}
          ref={c => {
            if (ref) {
              if (typeof ref === "function")
                ref(c);
              else ref.current = c;
            }
            inputRef.current = c;
          }}
          disableFullscreenUI={true}
          textAlignVertical={props.multiline ? "top" : undefined}
          inputMode="search"
          placeholderTextColor={context.selectedThemeIndex == 0 ? "#000000" : "#FFFFFF"}
          {...props}
          style={[style,
            {
              zIndex: 1,
              fontSize: 12,
              width: props.multiline
                ? "100%"
                : undefined,
              height: props.multiline ? "90%" : "auto"
            },
          ]}
        />
        <TouchableOpacity
          style={{
            marginTop: ((size?.height ?? 1) - 24) / 2,
            left: (size?.width ?? 0) + (size?.x ?? 0) - 24
          }}
          css="absolute zi-2"
          ifTrue={() => (
            props.readOnly !== true && (
              props.value?.has() ||
              props.defaultValue?.has()
              || txt?.has()
            ))
          }
          onPress={() => {
            inputRef.current?.clear();
            inputRef.current?.focus();
            props.onChangeText?.("");
            props.onSubmitEditing?.("");
          }}>
          <Icon
            css="bold co-red"
            type="AntDesign"
            name="close"
            size={10}
          />
        </TouchableOpacity>
      </View>
    );
  }
);
