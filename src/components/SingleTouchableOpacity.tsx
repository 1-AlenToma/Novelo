import { TouchableOpacity, useTimer, StyledProps } from "react-native-short-style";
import { TouchableOpacityProps } from "react-native";
import useLoader from "./Loader";

export const SingleTouchableOpacity = (props: TouchableOpacityProps & StyledProps & { hideLoader?: boolean }) => {

    const timer = useTimer(500);
    const loader = useLoader(false, undefined, "small");

    const click = async (event: any) => {
        if (loader.loading)
            return;
        loader.show()
        await props?.onPress?.(event);
        timer(() => loader.hide());

    }

    return (

        <TouchableOpacity {...props} disabled={loader.loading} onPress={click} >
            {props.hideLoader != true ? loader.elem : null}
            {props.children}
        </TouchableOpacity>
    )
}