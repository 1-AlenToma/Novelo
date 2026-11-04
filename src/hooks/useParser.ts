import * as React from "react";



export const useParser = (parserName?: string) => {
    const state = buildState(() => ({
        parser: context.parser.clone(parserName ?? context.parser.current.name)
    })).ignore("parser").build();

    context.useEffect(() => {
        state.parser?.dispose();
        state.parser = (context.parser.clone(parserName ?? context.parser.current.name));
    }, "parser.all");

    useEffect(() => {
        return () => {
            state.parser?.dispose();
        }
    }, [])
    return state.parser;
}