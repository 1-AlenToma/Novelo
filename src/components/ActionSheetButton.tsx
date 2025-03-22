import { ActionSheet, Modal } from "./ReactNativeComponents";
import * as React from "react";
import { Text, TouchableOpacity } from "./ReactNativeComponents";
import { ifSelector } from "../Methods";
export default ({
  btn,
  css,
  onPress,
  ifTrue,
  refItem,
  controller,
  ...props
}: {
  onPress?: any;
  css?: string;
  btn?: any;
  ifTrue: any;
  refItem?: any;
  controller?: "Modal" | "ActionSheet"
} & any) => {
  if (ifSelector(ifTrue) === false) return null;
  const [visible, setVisible] = useState(false);

  let tprops = {
    onPress: () => setVisible(true),
    onLongPress: undefined
  };

  if (refItem) {
    if (!refItem.current)
      refItem.current = {};
    refItem.current.close = () => setVisible(false);
    refItem.current.show = () => setVisible(true);
  }

  useEffect(() => {
    if (refItem)
      refItem.current?.onChange?.(visible)
  }, [visible])

  if (onPress) {
    tprops.onPress = onPress;
    tprops.onLongPress = () => setVisible(true);
  }

  const CN = controller == "Modal" ? Modal : ActionSheet;
  return (
    <>
      <TouchableOpacity {...tprops} style={{ backgroundColor: "transparent" }}>
        {typeof btn === "string" ? (
          <Text css={css}>{btn}</Text>
        ) : (
          btn
        )}
      </TouchableOpacity>
      <CN
        {...props}
        speed={400}
        isVisible={visible}
        onHide={() => setVisible(false)}
      />
    </>
  );
};
