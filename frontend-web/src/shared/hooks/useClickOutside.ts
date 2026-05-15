import * as React from 'react';

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onOutside: () => void,
  active: boolean
): void {
  React.useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutside();
      }
    };
    document.addEventListener('mousedown', handler);
    return (): void => {
      document.removeEventListener('mousedown', handler);
    };
  }, [active, ref, onOutside]);
}
