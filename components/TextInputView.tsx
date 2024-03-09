import { TextInput } from "react-native";
import * as React from "react";

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
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] =
      React.useState(false);
    const [txt, setTxt] = React.useState(
      props.defaultValue
    );
    let st = parseThemeStyle(
      style,
      css,
      invertColor
    );

    if (isModole) {
      return (
        <View css="flex">
          <Modal
            visible={visible}
            onHide={() => setVisible(false)}
            height="80">
            <View css="flex mat:20">
              <TouchableOpacity
                css="listButton bow:1 boc:#ccc juc:center ali:center mab:10"
                onPress={() =>{
                  props.onChangeText(txt);
                  setVisible(false)
                }
                }>
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
                style={st}
              />
            </View>
          </Modal>
          <TouchableOpacity
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
      <Input
        ref={ref}
        disableFullscreenUI={true}
        inputMode="search"
        placeholderTextColor={st.firstOrDefault(
          "color"
        )}
        {...props}
        style={st}
      />
    );
  }
);
