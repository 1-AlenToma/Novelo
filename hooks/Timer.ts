import { useEffect, useRef } from "react";

export default (ms: numer) => {
  const timer = useRef();

  let create = (func: Function, mss?: numer) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(func, mss || ms);
  };
  
  useEffect(()=>{
    return ()=> clearTimeout(timer.current);
  },[])
  
  return create;
};
