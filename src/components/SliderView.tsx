import * as React from "react";
import { View, Text, Button, Icon, SliderView } from "./ReactNativeComponents";
import { useTimer } from "hooks";


export default ({
  style,
  children,
  css,
  ifTrue,
  buttons,
  disableTimer,
  renderValue,
  ...props
}: any) => {
  const timer = useTimer(1000);
  const pressedTimer = useTimer(1000)
  const state = buildState({
    value: props.value ?? 0
  }).build();


  useEffect(() => {
    if (props.value !== state.value)
      state.value = props.value;
  }, [props.value]);

  const change = (v: any) => {
    if (Array.isArray(v))
      v = v[0]
    state.value = (v);
    if (disableTimer) {
      props.onValueChange?.(v);
      return;
    }

    timer(() => props.onValueChange?.(v));
  };

  const increase = (isPress?: boolean) => {
    let step = props.step ?? 1;
    if (state.value + step <= props.maximumValue) {
      let v = state.value + step;
      state.value = v;
      if (disableTimer)
        props.onValueChange?.(v)
      pressedTimer(() => {
        props.onValueChange?.(v) ?? props.onSlidingComplete?.(v);
      }, isPress ? 0 : undefined);
    }

  }

  const decrease = (isPress?: boolean) => {
    let step = props.step ?? 1;
    if (state.value - step >= props.minimumValue) {
      let v = state.value - step;
      state.value = v;
      if (disableTimer)
        props.onValueChange?.(v)
      pressedTimer(() => {
        props.onValueChange?.(v) ?? props.onSlidingComplete?.(v);
      }, isPress ? 0 : undefined);

    }
  }
  return (
    <View
      css={`clearwidth mah:40 row ali:center juc:space-between invert ${css}`} ifTrue={ifTrue}>
      <Button
        ifTrue={buttons === true}
        css="flex miw-40 maw:40 mal:10 invert he-40 sh-none"
        icon={<Icon
          name="minus-square"
          type="FontAwesome"
          css="fos-35 invert"
        />}
        onPress={() => decrease(true)}
        whilePressed={decrease}>
      </Button>

      <View
        css="wi:35 he:20 pal:5 par:5 juc:center ali:center invert"
        ifTrue={renderValue == true}>
        <Text
          css="desc fos:10 tea:center">
          {state.value}
        </Text>
      </View>
      <View css={`flex invert`} style={{ maxWidth: buttons ? "75%" : "90%" }}>
        <SliderView
          onStartShouldSetResponder={event =>
            false
          }
          minimumTrackTintColor="#f17c7c"
          maximumTrackTintColor="#000000"
          step={1}
          enableButtons={false}
          {...props}
          containerStyle={{ maxWidth: "99%" }}
          value={state.value}
          onSlidingComplete={(v) => props.onSlidingComplete?.(v[0])}
          onValueChange={change}
          style={style}
          css={css}
        />
      </View>

      <Button
        ifTrue={buttons === true}
        css="flex miw-40 maw:40 he-40 invert sh-none"
        icon={<Icon
          name="plus-square"
          type="FontAwesome"
          css="fos-35 invert"
        />}
        onPress={() => increase(true)}
        whilePressed={increase}>

      </Button>
    </View>
  );
};
