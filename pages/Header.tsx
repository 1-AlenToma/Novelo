import {
  View,
  Text,
  TouchableOpacity,
  SizeAnimator,
  TextInput,
  Icon
} from "../components";
import { useState } from "../native";
import gdata from "../GlobalContext";
import { proc } from "../Methods";
import { useNavigation } from "../hooks";
import { Button } from "../types";
import { useEffect, useRef } from "react";

export default ({
  inputEnabled,
  onInputChange,
  css,
  title,
  onBack,
  titleCss,
  buttons,
  value,
  ...props
}: {
  title?: boolean;
  onInputChange?: (text: string) => void;
  inputEnabled?: boolean;
  css?: string;
  onBack?: () => boolean;
  titleCss?: string;
  buttons?: Button[];
}) => {
  const [params, navOption] =
    useNavigation(props);
  gdata.hook(
    "theme.invertSettings",
    "KeyboardState",
    "isFullScreen"
  );
  const input = useRef();
  const state = useState(
    {
      text: "",
      inputAnimator: {
        width: gdata.size.screen?.width,
        state: false
      }
    },
    "inputAnimator"
  );

  useEffect(() => {
    if (value === "") {
      state.text = "";
      input.current?.clear();
    }
  }, [value]);

  gdata.subscribe(() => {
    if (
      inputEnabled &&
      state.inputAnimator.show
    ) {
      if (gdata.KeyboardState)
        state.inputAnimator.show();
      else state.inputAnimator.hide();
    }
  }, "KeyboardState");
  let inputWidth = proc(
    50,
    gdata.size.screen?.width
  );
  return (
    <>
      {state.inputAnimator.state &&
      gdata.KeyboardState ? (
        <TouchableOpacity
          onPress={() => input.current.blur()}
          css="absolute to:0 le:0 clearboth zi:100 blur"
        />
      ) : null}
      <View
        css="clearwidth zi:101 he:40 row juc:center ali:center di:flex"
        style={[css?.css()]}
        invertColor={true}>
        {navOption.canGoBack() ? (
          <TouchableOpacity
            css="absolute le:5"
            onPress={() => {
              if (!onBack || onBack())
                navOption.back();
            }}>
            <Icon
              invertColor={true}
              type="Ionicons"
              name="caret-back-outline"
            />
          </TouchableOpacity>
        ) : null}
        {inputEnabled && onInputChange ? (
          <SizeAnimator
            blur={true}
            css="wi:50% clearheight juc:center maw:80%"
            refItem={state.inputAnimator}>
            <TextInput
              ref={x => {
                input.current = x;
              }}
              invertColor={false}
              defaultValue={value}
              onChangeText={txt => {
                state.text = txt;
              }}
              disableFullscreenUI={true}
              enterKeyHint="search"
              inputMode="search"
              onSubmitEditing={() =>
                onInputChange(state.text)
              }
              placeholder="Search Novels"
              css="he:90% clearwidth bow:1 bor:3 bold boc:#ccc pal:10"
              onFocus={() =>
                state.inputAnimator.show()
              }
            />
          </SizeAnimator>
        ) : inputEnabled ? (
          <TouchableOpacity
            onPress={() => {
              navOption.nav("Search").push();
            }}
            invertColor={false}
            css="flex maw:98% he:85% juc:center pal:5 bor:2">
            <Text css="bold">Search Novels</Text>
          </TouchableOpacity>
        ) : title && !title.empty() ? (
          <Text
            invertColor={true}
            css={
              "header bold fos:18 foso:italic " +
              titleCss
            }>
            {title}
          </Text>
        ) : null}
        <View
          css="row juc:center ali:center absolute ri:5"
          ifTrue={buttons?.has() ?? false}>
          {buttons?.map((x, i) => (
            <TouchableOpacity
              ifTrue={x.ifTrue}
              onPress={x.press}
              key={i}>
              {typeof x.text == "function"
                ? x.text()
                : x.text}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
};
