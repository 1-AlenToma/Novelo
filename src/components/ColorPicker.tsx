import { View, Text, TouchableOpacity, Modal } from "react-native-short-style";
import { invertColor } from "../Methods";
import * as React from "react";
import ColorPicker, {
  Panel1,
  Preview,
  OpacitySlider,
  PreviewText,
  HueSlider
} from "reanimated-color-picker";
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';
const sliderStyle = {
  borderRadius: 20,

  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,

  elevation: 5,
}

const panelStyle = {
  borderRadius: 16,

  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,

  elevation: 5,
}
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
            <View css="flex ali:center mat:20 invert bow-5 bac-gray bor-10 pa-5">
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
                boundedThumb={true}
                sliderThickness={25}
                thumbSize={24}
                thumbShape='circle'
                onCompleteJS={(colors) => {
                  onComplete?.(colors);
                }}>
                <PreviewText style={{
                  color: invertColor(value),
                  fontFamily: 'Quicksand',
                }} colorFormat="hex" />
                <View css="bac-transparent mab-10">
                  <Panel1 style={panelStyle} />
                </View>

                <View css="bac-transparent mab-10">
                  <HueSlider style={sliderStyle} />
                </View>
                <OpacitySlider style={sliderStyle} />
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
