import * as React from "react";
import { ActivityIndicator } from "react-native";
import { View, AnimatedView, Text, TouchableOpacity, ScrollView, ProgressBar } from "react-native-short-style";


export default (
  initValue?: boolean,
  text?: string,
  size?: number | "small" | "large"
) => {
  const state = buildState({
    loading: initValue ?? false,
    progressValue: undefined as number | undefined
  }).build();

  useEffect(() => {
    state.loading = (initValue ?? false);
  }, [initValue]);

  const show = (progress?: number) => {
    state.batch(() => {
      state.progressValue = (progress);
      state.loading = (true);
    })
  };

  const hide = () => {
    state.batch(() => {
      state.progressValue = undefined;
      state.loading = false
    })
  };

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
  return { show, hide, elem, loading: state.loading };
};
