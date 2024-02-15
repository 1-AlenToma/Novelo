import Icon from "./Icons";
import TouchableOpacity from "./TouchableOpacityView";
import View from "./ThemeView";
import Text from "./ThemeText";
import Modal from "./Modal";
import { ScrollView } from "react-native";

const g = require("../GlobalContext").default;
export default () => {
  g.hook("alertMessage");
  let message = g.alertMessage;
  let confirm = (answer: boolean) => {
    message.confirm?.(answer);
    message.msg = undefined;
  };

  return (
    <Modal
      toTop={true}
      height={200}
      visible={message.msg != undefined}
      onHide={() => confirm(false)}>
      <ScrollView>
        <View css="flex pal:5 clearboth">
          <Text
            ifTrue={message.title != undefined}
            invertColor={true}
            css="header pab:10 bold fos:15">
            {message.title}
          </Text>
          <Text
            invertColor={true}
            css="desc clearboth">
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
  );
};
