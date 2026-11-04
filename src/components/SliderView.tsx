import * as React from "react";
import { View, Text, Button, Icon, SliderView } from "react-native-short-style";
import useTimer from "../hooks/Timer";
import { PrimitiveObject } from "react-smart-state";


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
  const { mem } = useFunc();
  const pressedTimer = useTimer(1000);
  const valueChange = useTimer(1000);
  const state = PrimitiveObject(props.value ?? 0);


  useEffect(() => {
    if (props.value !== state.value)
      valueChange(() => {
        state.value = props.value;
      });
  }, [props.value]);

  const change = mem((v: any) => {
    if (Array.isArray(v))
      v = v[0]
    state.value = v;
    if (disableTimer) {
      props.onValueChange?.(v);
      return;
    }

    timer(() => props.onValueChange?.(v));
  }, props.onValueChange, disableTimer)

  const increase = mem((isPress?: boolean) => {
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

  }, props.step, props.onValueChange, props.onSlidingComplete, props.maximumValue)

  const decrease = mem((isPress?: boolean) => {
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
  }, props.step, props.onValueChange, props.onSlidingComplete, props.minimumValue);
  return (
    <View
      css={`clearwidth mah:40 row ali:center juc:space-between invert ${css}`} ifTrue={ifTrue}>
      <Button
        ifTrue={buttons === true}
        css="flex miw-40 maw:40 mal:10 invert he-40 sh-none"
        icon={mem(<Icon
          name="minus-square"
          type="FontAwesome"
          css="fos-35 invert"
        />)}
        onPress={mem(() => decrease(true), decrease)}
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
      <View css={`flex invert`} style={mem({ maxWidth: buttons ? "75%" : "90%" })}>
        <SliderView
          onStartShouldSetResponder={mem(() =>
            false
          )}
          minimumTrackTintColor="#f17c7c"
          maximumTrackTintColor="#000000"
          step={1}
          enableButtons={false}
          {...props}
          containerStyle={mem({ maxWidth: "99%" })}
          value={state.value}
          onSlidingComplete={mem((v) => props.onSlidingComplete?.(v[0]), props.onSlidingComplete)}
          onValueChange={change}
          style={style}
          css={css}
        />
      </View>

      <Button
        ifTrue={buttons === true}
        css="flex miw-40 maw:40 he-40 invert sh-none"
        icon={mem(<Icon
          name="plus-square"
          type="FontAwesome"
          css="fos-35 invert"
        />)}
        onPress={mem(() => increase(true), increase)}
        whilePressed={increase}>

      </Button>
    </View>
  );
};
