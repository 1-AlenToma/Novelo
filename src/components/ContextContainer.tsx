import * as React from "react";
import { GlobalType } from "../Types";
import { NestedKeyOf, getValueByPath } from "react-smart-state";

type ContextContainerProps<T extends object> = {
    stateItem?: T,
    render: (state: T) => React.ReactNode;
    extra?: any[];
    globalStateKeys?: NestedKeyOf<GlobalType>[]
}

export function ContextContainer<T extends object>(props: ContextContainerProps<T>) {
    const state = buildState(() => (props.stateItem ?? ({ nothing: true }))).build();

    const values = Object.keys(props.stateItem ?? {}).map(x => (state as any)[x]).filter(x => x !== null);
    if (props.globalStateKeys?.has()) {
        context.hook(...props.globalStateKeys as any);
        values.push(...props.globalStateKeys.map(x => getValueByPath(context, x)))
    }
    const elem = React.useMemo(() => {
        return props.render(state as T);
    }, [...values, ...(props.extra ?? [])])


    return elem;
}