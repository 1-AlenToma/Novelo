import { TouchableOpacity } from "react-native";
import globalData from "../GlobalContext";

export default ({
  style,
  children,
  invertColor,
  css
}: any) => {
  
  let st =
    style && Array.isArray(style)
      ? [...style]
      : [style || {}];
  if (css) st.push(css.css());
  return (
    <TouchableOpacity style={st}>
      {children}
    </TouchableOpacity>
  );
};
