import * as React from 'react';

export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'JPY' | 'CAD' | 'CHF' | 'MXN' | 'BRL';

export interface CurrencyOption {
  readonly value: CurrencyCode;
  readonly label: string;
  readonly symbol: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'GBP', label: 'Pound Sterling', symbol: '£' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'CA$' },
  { value: 'CHF', label: 'Swiss Franc', symbol: 'Fr' },
  { value: 'MXN', label: 'Mexican Peso', symbol: 'MX$' },
  { value: 'BRL', label: 'Brazilian Real', symbol: 'R$' },
];

export interface ICurrencyAdapter {
  readonly currency: CurrencyCode;
  readonly setCurrency: (c: CurrencyCode) => void;
}

const STORAGE_KEY = 'currency';
const DEFAULT_CURRENCY: CurrencyCode = 'EUR';
const CURRENCY_CHANGE_EVENT = 'ish:currency-change';

function readStoredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return CURRENCY_OPTIONS.some((o) => o.value === stored)
    ? (stored as CurrencyCode)
    : DEFAULT_CURRENCY;
}

export function useCurrencyAdapter(): ICurrencyAdapter {
  const [currency, setCurrencyState] = React.useState<CurrencyCode>(readStoredCurrency);

  // Sync with other hook instances in the same tab via custom window event
  React.useEffect(() => {
    const handler = (e: Event): void => {
      setCurrencyState((e as CustomEvent<CurrencyCode>).detail);
    };
    window.addEventListener(CURRENCY_CHANGE_EVENT, handler);
    return (): void => {
      window.removeEventListener(CURRENCY_CHANGE_EVENT, handler);
    };
  }, []);

  const setCurrency = React.useCallback((c: CurrencyCode): void => {
    window.localStorage.setItem(STORAGE_KEY, c);
    window.dispatchEvent(new CustomEvent<CurrencyCode>(CURRENCY_CHANGE_EVENT, { detail: c }));
  }, []);

  return { currency, setCurrency };
}
