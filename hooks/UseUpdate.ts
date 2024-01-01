import { useState } from "react";
import { newId } from "../Methods";

export default () => {
  const [id, setId] = useState();
  const update = () => {
    setId(newId());
  };
  
  return ()=> update()
};
