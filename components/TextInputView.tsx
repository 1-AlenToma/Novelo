import { TextInput } from "react-native";
import {
  removeProps,
  parseThemeStyle
} from "../Methods";

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
    <TextInput
    disableFullscreenUI={true}
      inputMode="search"
      {...props}
      
      style={st}
    />
  );
};
