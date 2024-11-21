import * as React from "react";
import { ActivityIndicator } from "react-native";
import { View, AnimatedView, Text, TouchableOpacity, ScrollView, ProgressBar } from "./ReactNativeComponents";


export default (
  initValue?: boolean,
  text?: string
) => {
  const [loading, setLoading] = useState(
    initValue ?? false
  );
  const [progressValue, setProgressValue] = useState<number | undefined>();

  useEffect(() => {
    setLoading(initValue ?? false);
  }, [initValue]);

  const show = (progress?: number) => {
    setProgressValue(progress);
    setLoading(true);
  };

  const hide = () => {
    setLoading(false);
    setProgressValue(undefined);
  };

  let elem = !loading ? null : (
    <View css="absolute flex to:0 le:0 clearboth zi:9999 juc:center ali:center clb">
      <View css="clearboth blur absolute zi:1" />
      <ActivityIndicator
        size="large"
        style={{
          zIndex: 2
        }}
      />
      <ProgressBar
        ifTrue={(progressValue ?? 0) > 0}
        value={progressValue / 100}
      >
        <Text css="fos-12 bold co-#FFFFFF">{(progressValue ?? 0).readAble()}%</Text>
      </ProgressBar>
      <Text
        ifTrue={text != undefined}
        css="bold co:#ffffff fos:18 zi:3">
        {text}
      </Text>
    </View>
  );
  return { show, hide, elem, loading };
};
