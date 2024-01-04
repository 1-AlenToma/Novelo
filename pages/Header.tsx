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

export default ({
  inputEnabled,
  onInputChange,
  css,
  title,
  onBack,
  titleCss,
  ...props
}: {
  title?: boolean;
  onInputChange?: (text: string) => void;
  inputEnabled?: boolean;
  css?: string;
  onBack?: () => boolean;
  titleCss?:string;
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
    if (inputEnabled && state.inputAnimator.show) {
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
      css="clearwidth h:40 row jc:center ai:center d:flex"
      style={[css?.css()]}
      invertColor={true}>
      {navOption.canGoBack() ? (
        <TouchableOpacity
          css="absolute l:5"
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
          css="w:50% clearheight jc:center bc:red mw:80%"
          refItem={state.inputAnimator}>
          <TextInput
            onChangeText={txt => {
              state.text = txt;
              onInputChange?.(txt);
            }}
            placeholder="Search Novels"
            css="h:90% clearwidth bw:1 bco:#ccc pl:5"
            onFocus={() =>
              state.inputAnimator.show()
            }
          />
        </SizeAnimator>
      ) : inputEnabled ? (
        <TouchableOpacity
          invertColor={false}
          css="flex mw:98% h:85% jc:center  pl:5 br:2">
          <Text css="bold">Search Novels</Text>
        </TouchableOpacity>
      ) : title && !title.empty() ? (
        <Text
          invertColor={true}
          css={"header bold fs:18 fso:italic " + titleCss}>
          {title}
        </Text>
      ) : null}
    </View>
  );
};
