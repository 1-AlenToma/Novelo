import * as React from "react";
import { Text, TouchableOpacity, ReadyView, ActionSheet, Modal } from "react-native-short-style/mems";
import { ifSelector } from "../Methods";
import { SingleTouchableOpacity } from "./SingleTouchableOpacity";
export default ({
  btn,
  css,
  onPress,
  ifTrue,
  refItem,
  controller,
  ready,
  speed,
  ...props
}: {
  onPress?: any;
  css?: string;
  btn?: any;
  ifTrue: any;
  refItem?: any;
  speed?: number;
  controller?: "Modal" | "ActionSheet"
} & any) => {

  const state = buildState({
    visible: false
  }).build();
  const {mem, memo}  = useFunc();

  let tprops = {
    onPress: () => state.visible=(true),
    onLongPress: undefined as Function | undefined
  };

  if (refItem) {
    if (!refItem.current)
      refItem.current = {};
    refItem.current.close = () => state.visible=(false);
    refItem.current.show = () => state.visible =(true);
  }

  useEffect(() => {
    if (refItem)
      refItem.current?.onChange?.(state.visible)
  }, [state.visible])

  if (onPress) {
    tprops.onPress = onPress;
    tprops.onLongPress = () => state.visible= (true);
  }
  let extra = controller == "Modal" ? { css: `he-${props.size} wi-95%` } : {}
  const CN = controller == "Modal" ? Modal : ActionSheet;
  const Container = ready !== false ? ReadyView : React.Fragment;
  let containerProps: any = {};
  if (ready != false)
    containerProps = { css: "bac-transparent", timeout: 2 };

  if (ifSelector(ifTrue) === false) return null;
  return (
    <>
      <SingleTouchableOpacity hideLoader={true} {...tprops as any} style={mem({ backgroundColor: "transparent" })}>
        {typeof btn === "string" ? (
          <Text css={css}>{btn}</Text>
        ) : (
          btn
        )}
      </SingleTouchableOpacity>
      <CN
        {...props}
        {...extra}
        speed={speed ?? 300}
        isVisible={state.visible}
        onHide={mem(() => state.visible=(false))}
      >
        <Container {...containerProps}>
          {props.children}
        </Container>
      </CN>
    </>
  );
};
