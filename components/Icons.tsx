import * as Icons from "@expo/vector-icons";
import { removeProps } from "../Methods";

export default ({
  name,
  type,
  size,
  style,
  css,
  ...props
}: any) => {
  let ICO = Icons[type];
  let st =
    style && Array.isArray(style)
      ? [...style]
      : [style || {}];
  if (css) {
    st.push(css.css());
  }
  return (
    <ICO
      {...props}
      style={removeProps(
        st,
        "backgroundColor",
        "fontSize"
      )}
      size={parseInt((24).sureValue(size))}
      name={name}
    />
  );
};
