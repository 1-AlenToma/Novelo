

import { useCallback } from "react";

type DebouncedFn = {
  (fn: () => void, delay?: number): void;
  clear: () => void;
};

export default function useDebounce(ms: number): DebouncedFn {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const debounce = useCallback(((fn: () => void, delay?: number) => {
    clear();
    if (delay == 0)
      fn();
    else
      timer.current = setTimeout(fn, delay ?? ms);
  }) as DebouncedFn, [ms, clear]);

  debounce.clear = clear;

  useEffect(() => {
    return clear;
  }, [clear]);

  return debounce;
}