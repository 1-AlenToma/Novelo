import { newId } from "../Methods";
import { useTimer } from "../hooks";
import { UseState } from "../GlobalState";
const speed = 12;

export default <T>(
  item: T,
  ...ignoreKeys: (keyof T)[]
) => {
  let state = UseState(item, ...ignoreKeys);

  return state;
};
