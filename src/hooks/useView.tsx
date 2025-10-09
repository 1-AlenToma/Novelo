import { View } from "react-native-short-style";
import useUpdate from "./UseUpdate";
import * as React from "react";
import useLoader from "../components/Loader";
import useTimer from "./Timer";

interface ViewState<T> {
  size: { width: number; height: number };
  update: () => void;
  refItem: any;
  id: string;
}

interface Props<T> {
  state?: T;
  component: any;
  timer?: number;
  key?: string;
  loader?: {
    text?: string;
    value?: boolean;
  },
  ref?: (c: any) => void;
  [key: string]: any;
}



export default function <T>({
  state,
  component,
  ...props
}: Props<T>) {
  let gProps: any = props as any;
  const update = useUpdate();
  const timer = useTimer(gProps.timer ?? 100);
  const loader = useLoader(
    gProps.loader?.value ?? false,
    gProps.loader?.text
  );
  const itemState = buildState<ViewState<T>>(() =>
  (
    {
      ...(state ?? {}),
      size: { width: 0, height: 0 },
      update: () => update(),
      refItem: gProps.refItem ?? {},
      id: methods.newId()
    })).ignore(
      "refItem", "size", ...(gProps.ignore ?? [])
    ).build();

  let render = (children: any, prs?: any) => {
    if (component !== false) {
      prs = { ...props, ...(prs ?? {}) } as any;
      const Component = component ?? View;
      return (
        <Component

          {...prs}
          key={props.key}
          onLayout={(event : any) => {

            itemState.size = { ...event.nativeEvent.layout };
            gProps.onLayout?.(event);
          }}>
          {children}
        </Component>
      );
    }
    return <>{children}</>;
  };

  return [
    render,
    itemState as any as (typeof itemState & ViewState<T> & T),
    loader,
    timer
  ] as const;
}
