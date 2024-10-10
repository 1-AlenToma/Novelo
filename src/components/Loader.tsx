import * as React from "react";
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
    <View css="absolute flex to:0 le:0 clearboth zi:9999 juc:center ali:center">
      <View css="clearboth blur absolute zi:1" />
      <ActivityIndicator
        size="large"
        style={{
          zIndex: 2
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
