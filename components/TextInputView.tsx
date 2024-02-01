import { TextInput } from "react-native";
import * as React from "react";

import {
  removeProps,
  parseThemeStyle,
  StyledView
} from "../Methods";
const Input = StyledView(TextInput, "TextInput");
export default React.forwardRef(
  (
    { style, invertColor, css, ...props },
    ref
  ) => {
    let st = parseThemeStyle(
      style,
      css,
      invertColor
    );

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
