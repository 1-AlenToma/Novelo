import { useRef, useEffect } from "react";
export const useTimer = (ms: number) => {
    const timer = useRef<any>();

    let create = function (func: Function, mss?: number) {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => func(), mss || ms);
    };
    (create as any).clear = () => clearTimeout(timer.current);

    useEffect(() => {
        return () => clearTimeout(timer.current);
    }, [])
    const func = create as any as (((func: Function, mss?: number) => void) & { clear: () => void });

    
    return func;
};