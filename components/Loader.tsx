import { useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import View from "./ThemeView";
import Text from "./ThemeText";
import ProgressBar from "./ProgressBar";

export default (
  initValue?: boolean,
  text?: string
) => {
  const [loading, setLoading] = useState(
    initValue ?? false
  );
  const [progressValue, setProgressValue] =
    useState();
  const [size, setSize] = useState({
    x: 0,
    y: 0,
    height: 0,
    width: 0
  });

  const show = (progress?: number) => {
    setProgressValue(progress);
    setLoading(true);
  };

  const hide = () => {
    setLoading(false);
    setProgressValue(undefined);
  };

  let elem = !loading ? null : (
    <View
      css="absolute flex to:0 le:0 clearboth zi:9999 juc:center ali:center"
      onLayout={event => {
        setSize(event.nativeEvent.layout);
      }}>
      <View css="clearboth blur absolute zi:1" />
      <ActivityIndicator
        size="large"
        style={{
          zIndex: 2,
          position: "absolute",
          left: size.width / 2 - 25,
          top: size.height / 2 - 25
        }}
      />
      <ProgressBar
        ifTrue={() => progressValue > 0}
        procent={progressValue}
      />
      <Text
        ifTrue={() => text != undefined}
        css="bold co:#ffffff fos:18 zi:3">
        {text}
      </Text>
    </View>
  );
  return { show, hide, elem, loading };
};
