import { useState, useEffect } from "react";
import { newId } from "../Methods";

export default onUpdate => {
  const [id, setId] = useState();
  const update = () => {
    setId(newId());
  };

  useEffect(() => {
    onUpdate?.();
  }, [id]);

  return () => update();
};
