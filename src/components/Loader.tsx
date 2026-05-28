import * as React from "react";
import { ActivityIndicator } from "react-native";
import { View, AnimatedView, Text, TouchableOpacity, ScrollView, ProgressBar, useTimer } from "react-native-short-style";


export default (
  initValue?: boolean,
  text?: string,
  size?: number | "small" | "large",
  onPress?: () => void
) => {
  const Container = onPress ? TouchableOpacity : View;
  const extraData = useRef(undefined);
  const { memo } = useFunc();
  const state = buildState(() => ({
    loading: initValue ?? false,
    progressValue: undefined as number | undefined,
    hide: () => {
      extraData.current = undefined;
      state.batch(() => {
        state.progressValue = undefined;
        state.loading = false;
      })
    },
    show: (progress?: number) => {
      state.batch(() => {
        state.progressValue = progress;
        state.loading = true;
      })
    },
    get: () => {
      return extraData.current;
    },
    set: (value: any) => {
      extraData.current = value;
      return state;
    },
    elem: null as any
  })).ignore("elem").build();
  const elem = memo(() => !state.loading ? null : (
    <Container activeOpacity={1} onPress={onPress} css="absolute flex to:0 le:0 clearboth zi:9999 juc:center ali:center clb">
      <View css="clearboth blur absolute zi:1" />
      <ActivityIndicator
        size={size ?? "large"}
        style={{
          zIndex: 2
        }}
      />
      <ProgressBar
        ifTrue={(state.progressValue ?? 0) > 0}
        value={state.progressValue / 100}>
        <Text css="fos-12 bold co-#FFFFFF">{(state.progressValue ?? 0).readAble()}%</Text>
      </ProgressBar>
      <Text
        ifTrue={text != undefined}
        css="bold co:#ffffff fos:18 zi:3">
        {text}
      </Text>
    </Container>
  ), state.loading, state.progressValue, text, size);
  memo(() => {
    delete state.elem;
    Object.defineProperty(state, "elem",
      {
        get: () => elem,
        configurable: true
      });
  }, elem)
  

  useEffect(() => {
    state.loading = initValue ?? false;
  }, [initValue]);

  return state
};
