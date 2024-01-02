import { useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import View from "./ThemeView";

export default initValue => {
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
      css="absolute flex t:0 l:0 clearboth zi:9999 jc:center ai:center"
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
    </View>
  );
  return { show, hide, elem, loading };
};
