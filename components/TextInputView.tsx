import { TextInput } from "react-native";

import {
  removeProps,
  parseThemeStyle,
  StyledView
} from "../Methods";
const Input = StyledView(TextInput, "TextInput");
export default ({
  style,
  invertColor,
  css,
  ...props
}: any) => {
  let st = parseThemeStyle(
    style,
    css,
    invertColor
  );

  return (
    <Input
      disableFullscreenUI={true}
      inputMode="search"
      {...props}
      style={st}
    />
  );
};
