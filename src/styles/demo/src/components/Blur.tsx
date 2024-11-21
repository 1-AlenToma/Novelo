import { optionalStyle } from "../config";
import { BlurProps } from "../Typse";
import { AnimatedTouchableOpacity, AnimatedView } from "./ReactNativeComponents";

export const Blur = (props: BlurProps) => {
    let hProps = { ...props };
    const Component = props.onPress ? AnimatedTouchableOpacity : AnimatedView;
    const onPress = (event: any) => {
        props?.onPress?.(event);
    }
    if (!hProps.onPress && hProps.activeOpacity === undefined)
        props.activeOpacity = 1;
    if (props.onPress)
        hProps.onPress = onPress;

    return (<Component {...hProps} css={x => x.cls("_blur").joinRight(hProps.css)} />)
}