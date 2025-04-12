import * as React from "react";
import { View, Text, TouchableOpacity, Icon, SliderView } from "./ReactNativeComponents";
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
  const timer = useTimer(500);
  const [value, setValue] = useState(props.value);
  if (ifTrue === false) return null;

  useEffect(() => {
    if (props.value !== value)
      setValue(props.value);
  }, [props.value]);

  const change = (v: any) => {
    if (Array.isArray(v))
      v = v[0]
    setValue(v);
    if (disableTimer) {
      props.onValueChange?.(v);
      return;
    }

    timer(() => props.onValueChange?.(v));
  };
  return (
    <View
      css={`clearwidth mah:40 row ali:center juc:space-between invert ${css}`}>
      <>
        {buttons ? (
          <TouchableOpacity
            css="flex maw:35 mal:10"
            onPress={() => {
              let step = props.step ?? 1;
              if (
                props.value - step >=
                props.minimumValue
              ) {
                let v = props.value - step;
                props.onValueChange?.(v) ?? props.onSlidingComplete?.(v);
              }
            }}>
            <Icon
              name="minus-square"
              type="FontAwesome"
              css="fos-35"
            />
          </TouchableOpacity>
        ) : null}
        <View
          css="wi:35 he:20 pal:5 par:5 juc:center ali:center invert"
          ifTrue={() => renderValue == true}>
          <Text
            css="desc fos:10 tea:center">
            {(value ?? 0).readAble()}
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
            value={value}
            onSlidingComplete={(v) => props.onSlidingComplete?.(v[0])}
            onValueChange={change}
            style={style}
            css={css}
          />
        </View>
        {buttons ? (
          <TouchableOpacity
            css="flex maw:35"
            onPress={() => {
              let step = props.step ?? 1;
              if (
                props.value + step <=
                props.maximumValue
              ) {
                let v = props.value + step;
                props.onValueChange?.(v) ?? props.onSlidingComplete?.(v);
              }
            }}>
            <Icon
              name="plus-square"
              type="FontAwesome"
              css="fos-35"
            />
          </TouchableOpacity>
        ) : null}
      </>
    </View>
  );
};
