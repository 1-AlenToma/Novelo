import { View } from "../components";
import { useState } from "../native";
import useUpdate from "./UseUpdate";
import { useRef } from "react";
import useLoader from "../components/Loader";
import useTimer from "./Timer";

interface ViewState<T> {
  size: { width: number; height: number };
  update: () => void;
  refItem: any;
  id: string;
}

export default function <T>({
  state,
  component,
  ...props
}: {
  state: T;
  component: any;
}) {
  const update = useUpdate();
  const timer = useTimer(props.timer ?? 100);
  const loader = useLoader(
    props.loader?.value ?? false,
    props.loader?.text
  );
  const itemState = useState<ViewState<T>>(
    {
      ...(state ?? {}),
      size: { width: 0, height: 0 },
      update: () => update(),
      refItem: props.refItem ?? {},
      id: methods.newId()
    },
    ...["refItem",...(props.ignore ?? [])]
  );

  let render = (children, prs) => {
    if (component !== false) {
      prs = { ...props, ...(prs ?? {}) };
      const Component = component ?? View;
      return (
        <Component
          {...prs}
          onLayout={event => {
            itemState.size =
              event.nativeEvent.layout;
            props.onLayout?.(event);
          }}>
          {children}
        </Component>
      );
    }
    return <>{children}</>;
  };

  return [
    render,
    itemState,
    loader,
    timer
  ] as const;
}
