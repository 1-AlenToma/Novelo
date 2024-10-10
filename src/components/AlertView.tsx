import Icon from "./Icons";
import TouchableOpacity from "./TouchableOpacityView";
import View from "./ThemeView";
import Text from "./ThemeText";
import Modal from "./Modal";
import Toast from "./Toast";
import { ScrollView } from "react-native";
import * as React from "react";

export default () => {
  context.hook("alertMessage");
  const [size, setSize] = useState();
  const rendered = useRef(false);
  let message = context.alertMessage;
  let confirm = (answer: boolean) => {
    message.confirm?.(answer);
    message.msg = undefined;
  };

  context.useEffect(() => {
    setSize(undefined);
    rendered.current = false;
  }, "alertMessage");

  return (
    <>
      <Toast
        toTop={true}
        height={Math.max(90, size?.height ?? 1)}
        visible={
          message.msg != undefined &&
          message.toast === true
        }
        onHide={() => confirm(false)}
        title={message.title}>
        <ScrollView
          onContentSizeChange={(
            width,
            height
          ) => {
            setSize({ height: height * 2.5 });
          }}>
          <Text
            invertColor={true}
            css="desc fos:15 flex:0 pal:10">
            {message.msg}
          </Text>
        </ScrollView>
      </Toast>
      <Modal
        blur={message.confirm == undefined}
        toTop={true}
        title={message.title}
        height={Math.max(150, size?.height ?? 1)}
        visible={
          message.msg != undefined &&
          message.toast !== true
        }
        onHide={() => confirm(false)}>
        <ScrollView
          style={{ marginTop: 10 }}
          onContentSizeChange={(
            width,
            height
          ) => {
            setSize({ height: height * 2.5 });
          }}>
          <View css="flex pal:5 clearboth">
            <Text
              invertColor={true}
              css="desc fos:15 flex:0">
              {message.msg}
            </Text>
          </View>
        </ScrollView>
        <View
          ifTrue={message.confirm != undefined}
          css="di:flex row clearwidth he:30 juc:flex-end">
          <TouchableOpacity
            css="button"
            onPress={() => confirm(true)}>
            <Text invertColor={true}>YES</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => confirm(false)}
            css="button">
            <Text invertColor={true}>NO</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};
