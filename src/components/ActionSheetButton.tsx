import ActionSheet from "./ActionSheet";
import * as React from "react";
import {View, AnimatedView, Text, TouchableOpacity, ScrollView} from "./ReactNativeComponents";
import { ifSelector } from "../Methods";
export default ({
  btn,
  css,
  onPress,
  ifTrue,
  refItem,
  ...props
}: {
  onPress?: any;
  css?: string;
  btn?: any;
  ifTrue: any;
  refItem?: any;
} & any) => {
  if (ifSelector(ifTrue) === false) return null;
  const [visible, setVisible] = useState(false);

  let tprops = {
    onPress: () => setVisible(true),
    onLongPress: undefined
  };
  
  if(refItem)
    {
      refItem.current = {
        close:()=> setVisible(false),
        show:()=> setVisible(true)
      }
    }

  if (onPress) {
    tprops.onPress = onPress;
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
