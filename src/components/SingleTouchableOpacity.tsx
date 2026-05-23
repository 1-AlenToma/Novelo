import { TouchableOpacity, useTimer, StyledProps } from "react-native-short-style/mems";
import { TouchableOpacityProps } from "react-native";
import useLoader from "./Loader";

export const SingleTouchableOpacity = (props: TouchableOpacityProps & StyledProps & { hideLoader?: boolean }) => {

    const timer = useTimer(500);
    const loader = useLoader(false, undefined, "small");
    const cliked = useRef(false)

    const click = async (event: any) => {
        if (cliked.current || loader.loading)
            return;
        cliked.current = true;
        loader.show();

        await props?.onPress?.(event);
        timer(() => {
            loader.hide()
            cliked.current = false;
        });
    }

    return (

        <TouchableOpacity {...props} disabled={loader.loading} onPress={click} >
            {props.hideLoader != true ? loader.elem : null}
            {props.children}
        </TouchableOpacity>
    )
}