import * as React from "react";
import { ActivityIndicator } from "react-native";
import { View, AnimatedView, Text, TouchableOpacity, ScrollView, ProgressBar, useTimer } from "react-native-short-style";


export default (
  initValue?: boolean,
  text?: string,
  size?: number | "small" | "large"
) => {
  const [state, setState] = useState({
    loading: initValue ?? false,
    progressValue: undefined as number | undefined
  });

  const extraData = useRef(undefined);


  useEffect(() => {
    setState(pre => ({ ...pre, loading: initValue ?? false }))
  }, [initValue]);

  const show = (progress?: number) => {
    setState(pre => ({ progressValue: progress, loading: true }))

  };

  const hide = () => {
    extraData.current = undefined;
    setState(pre => ({ progressValue: undefined, loading: false }));
  };

  const get = () => {
    return extraData.current;
  }

  const set = (value: any) => {
    extraData.current = value;
    return { show, hide, loading: state.loading, get, set };
  }

  let elem = !state.loading ? null : (
    <View css="absolute flex to:0 le:0 clearboth zi:9999 juc:center ali:center clb">
      <View css="clearboth blur absolute zi:1" />
      <ActivityIndicator
        size={size ?? "large"}
        style={{
          zIndex: 2
        }}
      />
      <ProgressBar
        ifTrue={(state.progressValue ?? 0) > 0}
        value={state.progressValue / 100}
      >
        <Text css="fos-12 bold co-#FFFFFF">{(state.progressValue ?? 0).readAble()}%</Text>
      </ProgressBar>
      <Text
        ifTrue={text != undefined}
        css="bold co:#ffffff fos:18 zi:3">
        {text}
      </Text>
    </View>
  );
  return { show, hide, elem, loading: state.loading, get, set };
};
