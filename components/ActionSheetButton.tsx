import ActionSheet from "./ActionSheet";
import { useState } from "react";
import TouchableOpacity from "./TouchableOpacityView";
import Text from "./ThemeText";

export default ({
  btn,
  css,
  ...props
}: {
  css?: string;
  btn: any;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}>
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
