import { useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import View from "./ThemeView";
import ProgressBar from "./ProgressBar";

export default (initValue, progressValue) => {
  const [loading, setLoading] =
    useState(initValue);
  const [size, setSize] = useState({
    x: 0,
    y: 0,
    height: 0,
    width: 0
  });

  const show = () => {
    setLoading(true);
  };

  const hide = () => setLoading(false);

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
      <ProgressBar ifTrue={()=> progressValue>0} procent={progressValue} />
    </View>
  );
  return { show, hide, elem, loading };
};
