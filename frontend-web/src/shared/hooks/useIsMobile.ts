import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(
    window.innerWidth < MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${String(MOBILE_BREAKPOINT - 1)}px)`);

    const handleChange = (e: MediaQueryListEvent): void => {
      setIsMobile(e.matches);
    };

    mql.addEventListener('change', handleChange);
    setIsMobile(mql.matches);

    return (): void => {
      mql.removeEventListener('change', handleChange);
    };
  }, []);

  return isMobile;
}
