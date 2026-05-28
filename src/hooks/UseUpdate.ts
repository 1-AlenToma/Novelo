import { PrimitiveObject } from "react-smart-state";

export default (onUpdate?: Function) => {
  const state = buildState({ value: 0 }).timeout(10).build();
  const update = () => {
    state.value = state.value + 1 < 1000 ? state.value + 1 : 0;
  };

  useEffect(() => {
    onUpdate?.();
  }, [state.value]);

  return () => update();
};
