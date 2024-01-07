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

export default ({
  inputEnabled,
  onInputChange,
  css,
  title,
  onBack,
  titleCss,
  buttons,
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
    "isFullScreen"
  );
  const state = useState(
    {
      text: "",
      inputAnimator: {
        width: gdata.size.screen?.width
      }
    },
    "inputAnimator"
  );

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
    <View
      css="clearwidth he:40 row juc:center ali:center di:flex"
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
          css="wi:50% clearheight juc:center bac:red maw:80%"
          refItem={state.inputAnimator}>
          <TextInput
            onChangeText={txt => {
              state.text = txt;
              onInputChange?.(txt);
            }}
            placeholder="Search Novels"
            css="he:90% clearwidth bow:1 boc:#ccc pal:5"
            onFocus={() =>
              state.inputAnimator.show()
            }
          />
        </SizeAnimator>
      ) : inputEnabled ? (
        <TouchableOpacity
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
  );
};
