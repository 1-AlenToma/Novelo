import * as React from "react";
import { GlobalType } from "../Types";
import { NestedKeyOf, getValueByPath } from "react-smart-state";

type ContextContainerProps<T extends object> = {
    stateItem?: T,
    render: (state: T) => React.ReactNode;
    extra?: any[];
    globalStateKeys?: NestedKeyOf<GlobalType>[],
    ifTrue?: boolean
}

function _ContextContainer<T extends object>(props: ContextContainerProps<T>) {
    const state = buildState(() => (props.stateItem ?? ({ nothing: true }))).build();
    const { locMemo } = useFunc();

    const values = locMemo(() => Object.keys(props.stateItem ?? {}).map(x => (state as any)[x]).filter(x => x !== null), props.stateItem);
    let rData = [];
    if (props.globalStateKeys?.has()) {
        context.hook(...props.globalStateKeys as any);
        rData = context.useComputed(() => props.globalStateKeys.map(x => getValueByPath(context, x)), ...props.globalStateKeys)
        //locMemo(() => values.push(...props.globalStateKeys.map(x => getValueByPath(context, x))), values);
    }
    const elem = locMemo(() => {
        return props.render(state as T);
    }, ...values, ...rData, ...(props.extra ?? []))


    return elem;
}

export const ContextContainer = React.memo(_ContextContainer);