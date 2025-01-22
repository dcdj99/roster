import { useEffect, useCallback } from 'react';

export function useDebounce(callback, delay, dependencies) {
  const debouncedCallback = useCallback(callback, dependencies);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedCallback();
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [debouncedCallback, delay]);
}
