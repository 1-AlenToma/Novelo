import * as React from "react";
import { View, Text, TouchableOpacity, Icon, Modal, TextInput, StyledProps } from "react-native-short-style";
import { ISize } from "../Types";
import { StyleSheet, TextInputProps } from "react-native";


type Props = TextInputProps & StyledProps & {
  isModole?: boolean,
  inputVisible?: boolean,
  serachBar?: boolean
}

export default React.forwardRef(
  (
    {
      style,
      css,
      isModole,
      inputVisible,
      serachBar,
      ...props
    }: Props,
    ref: any
  ) => {

    const inputRef = React.useRef<typeof TextInput>(null);
    const [visible, setVisible] = React.useState(inputVisible || false);
    const [size, setSize] = React.useState<ISize | undefined>();
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
                  props?.onChangeText?.(txt ?? "");
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
        style={[styles.container, {
          flex: props.multiline ? 1 : undefined
        }]}
        css={`wi:100% ali:center fl-1 juc-center he-30 bor-2 View`}>
        <Icon ifTrue={serachBar == true} name="search" type="Ionicons" css="Text" size={20} style={styles.icon} />
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
            inputRef.current = c as any;
          }}
          disableFullscreenUI={true}
          textAlignVertical={props.multiline ? "top" : undefined}
          inputMode="search"
          placeholderTextColor={context.selectedThemeIndex == 0 ? "#000000" : "#FFFFFF"}
          {...props}
          style={[
            styles.input,
            {
              paddingLeft: serachBar ? 0 : 5,
              zIndex: 1,
              fontSize: 12,
              width: props.multiline
                ? "100%"
                : undefined,
              height: props.multiline ? "90%" : "auto"
            }, style
          ]}
        />

        <TouchableOpacity
          style={{
            marginTop: ((size?.height ?? 1) as number - 24) / 2,
            left: (size?.width ?? 0) as number + (size?.x ?? 0) - 24
          }}
          css="absolute zi-2 bac-transparent"
          ifTrue={() => (
            props.readOnly !== true && (
              props.value?.has() ||
              props.defaultValue?.has()
              || txt?.has()
            )) as any
          }
          onPress={() => {
            inputRef.current?.clear();
            inputRef.current?.focus();
            props.onChangeText?.("");
            props.onSubmitEditing?.(null);
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


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 1,
    paddingVertical: 2,
    margin: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginHorizontal: 5,
  },
  input: {
    flex: 1,
    fontSize: 16
  },
});
