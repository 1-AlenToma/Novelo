import * as React from "react";
import { Image } from "react-native-short-style/mems";

export const BlurView = ({ css }: { css?: string }) => {
    const { mem } = useFunc();
    return (<Image
        resizeMode="stretch"
        css={mem(x => x.cls("_abc").joinRight("clearwidth wi:100% he:100%").op(1).zI(-1).baC("$co-transparent").joinRight(css), css)}
        source={require("../assets/blur.jpg")} blurRadius={90} />)
}