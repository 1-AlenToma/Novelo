import * as React from "react";
import { Image, View } from "react-native-short-style";

export const BlurView = ({ css }: { css?: string }) => {


    return (<Image resizeMode="stretch" css={x => x.cls("_abc").joinRight("clearwidth wi:100% he:100%").op(1).zI(-1).baC("$co-transparent").joinRight(css ?? "")}
        source={require("../assets/blur.jpg")} blurRadius={90} />)
}