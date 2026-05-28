import * as React from "react";
import { PrimitiveObject } from "react-smart-state";

export const useNumColumns = () => {
    const { mem } = useFunc();
    const calc = mem(() => {
        const windowWidth = context.size.window.width as number * 0.9;

        const minItemWidth = 120;
        const maxItemWidth = 150;

        // Compute number of columns based on min width constraint
        let numColumns = Math.floor(windowWidth / minItemWidth);

        // Recompute actual item width based on column count
        let width = windowWidth / numColumns;

        // Clamp the width to maxItemWidth and adjust column count if needed
        if (width > maxItemWidth) {
            width = Math.min(width, maxItemWidth);
            numColumns = Math.floor(windowWidth / width);
        }
        return {
            width,
            numColumns
        }
    });
    const state = buildState(()=> calc()).build();

    context.useEffect(() => {
        state.resetState();
    }, "size")
    return state;
}