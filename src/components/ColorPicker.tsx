import View from "./ThemeView";
import TouchableOpacity from "./TouchableOpacityView";
import Text from "./ThemeText";
import Modal from "./Modal";
import { invertColor } from "../Methods";
import * as React from "react";
import { ScrollView } from "react-native";
import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  OpacitySlider,
  HueSlider
} from "reanimated-color-picker";

export default ({
  css,
  value,
  onComplete
}: any) => {
  const [visible, setVisible] = useState(false);
  return (
    <TouchableOpacity
      onPress={() => setVisible(true)}
      css={`juc:center ali:center bor:5 flex ${css}`}
      style={{
        backgroundColor: value
      }}>
      <Modal
        height="80"
        visible={visible}
        onHide={() => setVisible(false)}>
        <ScrollView>
          <View css="flex ali:center mat:20">
            <View
              css="juc:center ali:center bor:5 wi:90% mab:10 pa:10"
              style={{
                backgroundColor: value
              }}>
              <Text
                style={{
                  color: invertColor(value)
                }}
                css="bold fos:18">
                Preview Text
              </Text>
            </View>
            <ColorPicker
              style={{ width: "90%", flex: 1 }}
              value={value}
              onComplete={onComplete}>
              <Preview />
              <Panel1 />
              <HueSlider />
              <OpacitySlider />
              <Swatches />
            </ColorPicker>
          </View>
        </ScrollView>
      </Modal>
      <Text
        style={{ color: invertColor(value) }}
        css="bold">
        Pick a Color
      </Text>
    </TouchableOpacity>
  );
};
