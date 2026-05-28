import * as React from "react";
import { View, Text, TouchableOpacity, Icon, Modal, TextInput, StyledProps } from "react-native-short-style";
import { ISize } from "../Types";
import { StyleSheet, TextInputProps } from "react-native";


type Props = TextInputProps & StyledProps & {
  isModole?: boolean,
  inputVisible?: boolean,
  serachBar?: boolean;
  label?: string;
}

export default React.forwardRef(
  (
    {
      style,
      css,
      isModole,
      inputVisible,
      serachBar,
      label,
      ...props
    }: Props,
    ref: any
  ) => {

    const inputRef = React.useRef<typeof TextInput>(null);
    const state = buildState(() => ({
      visible: inputVisible || false,
      size: undefined as ISize | undefined,
      hasFocus: false,
      txt: props.value ?? props.defaultValue ?? ""
    })).build();
    const { mem, memKey } = useFunc();

    if (methods.ifSelector(props.ifTrue) === false)
      return null;

    if (isModole) {
      return (
        <View css="flg-1 width-100% he-100%">
          <Modal
            addCloser={true}
            disableBlurClick={false}
            isVisible={state.visible}
            onHide={mem(() => state.visible = false)}
            css="he-80%">
            <View css="flex mat:20">
              <TouchableOpacity
                css="listButton bow:1 boc:#ccc juc:center ali:center mab:10 invert"
                onPress={() => {
                  props?.onChangeText?.(state.txt ?? "");
                  state.visible = false;
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
                onChangeText={t => state.txt = t}
                style={[style, { flex: 1, textAlignVertical: props.multiline ? "top" : undefined }]}
              />
            </View>
          </Modal>
          <TouchableOpacity
            ifTrue={() => inputVisible != true}
            onPress={mem(() => state.visible = true)} css="fl-1">
            <TextInput
              disableFullscreenUI={true}
              inputMode="search"
              {...props}
              css={css}
              readOnly={true}
              style={mem([style, { flexGrow: 1, width: 200, textAlignVertical: props.multiline ? "top" : undefined }], style, props.multiline)}
            />
          </TouchableOpacity>
        </View>
      );
    }

    const hasText = state.txt.length > 0 // safer
    const lblBackground: any = { backgroundColor: state.hasFocus || hasText ? null : "transparent" }
    if (!lblBackground.backgroundColor) {
      delete lblBackground.backgroundColor;

    } else lblBackground.color = "gray";
    return (
      <View
        style={mem([styles.container, {
          flex: props.multiline ? 1 : undefined
        }], props.multiline, styles.container)}
        css={`wi:100% ali:center fl-1 juc-center he-30 bor-2 View`}>
        <Icon ifTrue={serachBar == true} name="search" type="Ionicons" css="Text" size={20} style={styles.icon} />
        <Text
          ifTrue={label != undefined}
          css="invert"
          style={mem({
            position: "absolute",
            left: 5,
            fontSize: 12,
            top:
              state.hasFocus || hasText
                ? -((state.size?.height as number ?? 20) / 2 + 2)
                : ((state.size?.height as number ?? 20) / 2) - 5,
            zIndex: 2,
            ...lblBackground
          }, state.hasFocus, state.size,)}
        >
          {label}
        </Text>
        <TextInput
          onLayout={mem(e => {
            state.size = (e.nativeEvent.layout);
          })}
          ref={mem(c => {
            if (ref) {
              if (typeof ref === "function")
                ref(c);
              else ref.current = c;
            }
            inputRef.current = c as any;
          })}
          onFocus={mem(() => state.hasFocus = true)}
          onBlur={mem(() => {
            state.hasFocus = false;
          })}
          disableFullscreenUI={true}
          textAlignVertical={props.multiline ? "top" : undefined}
          inputMode="search"
          placeholderTextColor={context.selectedThemeIndex == 0 ? "#000000" : "#FFFFFF"}
          {...props}
          onChangeText={mem(text => {
            state.txt = text;
            props?.onChangeText?.(text);
          }, props.onChangeText)}
          style={mem([
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
          ], props.multiline, style, serachBar)}
        />

        <TouchableOpacity
          style={mem({
            marginTop: ((state.size?.height ?? 1) as number - 24) / 2,
            left: (state.size?.width ?? 0) as number + (state.size?.x ?? 0) - 34
          }, state.size)}
          css="absolute zi-2 bac-transparent"
          ifTrue={() => (
            props.readOnly !== true && (
              props.value?.has()
              || hasText
            )) as any
          }
          onPress={mem(() => {
            inputRef.current?.clear();
            inputRef.current?.focus();
            state.txt = "";
            props.onChangeText?.("");
            props.onSubmitEditing?.(null);
          }, props.onSubmitEditing, props.onChangeText)}>
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
