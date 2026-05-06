import * as React from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect((): (() => void) => {
    const t = setTimeout((): void => {
      setDebounced(value);
    }, delay);
    return (): void => {
      clearTimeout(t);
    };
  }, [value, delay]);
  return debounced;
}
