import ActionSheet from "./ActionSheet";
import { useState } from "react";
import TouchableOpacity from "./TouchableOpacityView";
import Text from "./ThemeText";

export default ({
  btn,
  css,
  onPress,
  ...props
}: {
  css?: string;
  btn: any;
}) => {
  const [visible, setVisible] = useState(false);

  let tprops = {
    onPress: () => setVisible(true)
  };
  if (onPress) {
     tprops.onPress = onPress
    tprops.onLongPress = () => setVisible(true);
  }
  return (
    <>
      <TouchableOpacity {...tprops}>
        {typeof btn === "string" ? (
          <Text css={css}>{btn}</Text>
        ) : (
          btn
        )}
      </TouchableOpacity>
      <ActionSheet
        {...props}
        speed={400}
        visible={visible}
        onHide={() => setVisible(false)}
      />
    </>
  );
};
