import { View, Text, TouchableOpacity, Modal } from "./ReactNativeComponents";
import { invertColor } from "../Methods";
import * as React from "react";
import ColorPicker, {
  Panel1,
  Preview,
  OpacitySlider,
  HueSlider
} from "reanimated-color-picker";
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';

export default ({
  css,
  value,
  onComplete
}: any) => {
  const [visible, setVisible] = useState(false);
  return (
    <TouchableOpacity
      onPress={() => setVisible(true)}
      css={`juc:center ali:center bor:5 flex invert ${css}`}
      style={{
        backgroundColor: value
      }}>
      <Modal
        css="he-80%"
        isVisible={visible}
        addCloser={true}
        onHide={() => setVisible(false)}>
        <GestureHandlerRootView style={{ flex: 1 }}>

          <ScrollView>
            <View css="flex ali:center mat:20 invert">
              <View
                css="juc:center ali:center bor:5 wi:90% mab:10 pa:10 invert"
                style={{
                  backgroundColor: value ?? "gray"
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
                <View css="bac-transparent mab-10">
                  <Panel1 />
                </View>

                <View css="bac-transparent mab-10">
                  <HueSlider />
                </View>
                <OpacitySlider />
              </ColorPicker>
            </View>
          </ScrollView>
        </GestureHandlerRootView>
      </Modal>
      <Text
        style={{ color: invertColor(value) }}
        css="bold pal-5 par-5">
        Pick a Color
      </Text>
    </TouchableOpacity>
  );
};
