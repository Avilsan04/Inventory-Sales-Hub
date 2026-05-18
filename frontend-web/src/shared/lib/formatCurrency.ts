import { useLanguageAdapter } from '@adapters/useLanguageAdapter';
import { useCurrencyAdapter } from '@adapters/useCurrencyAdapter';

/** Convert euro display amount to integer cents for API layer */
export function toCents(euros: number): number {
  return Math.round(euros * 100);
}

/** Convert integer cents from API layer to euro display amount */
export function fromCents(cents: number): number {
  return cents / 100;
}

/** Format an integer-cent amount as a localized currency string */
export function formatCurrency(amountInCents: number, currency: string, locale = 'en-GB'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInCents / 100);
}

const LOCALE_MAP: Record<string, string> = { en: 'en-GB', es: 'es-ES' };

/**
 * Hook bound to active locale and active currency from the currency adapter.
 * All components must use this instead of the plain formatCurrency function.
 */
export function useFormatCurrency(): (amountInCents: number) => string {
  const { language } = useLanguageAdapter();
  const { currency } = useCurrencyAdapter();
  const locale = LOCALE_MAP[language] ?? 'en-GB';
  return (amountInCents: number) => formatCurrency(amountInCents, currency, locale);
}

/** Format a plain (non-cents) amount as a localized currency string */
export function formatAmount(amount: number, currency: string, locale = 'en-GB'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Hook that formats plain (non-cents) amounts using the active locale and currency.
 * Use for analytics and inventory values that come from the backend as raw decimals.
 */
export function useFormatAmount(): (amount: number) => string {
  const { language } = useLanguageAdapter();
  const { currency } = useCurrencyAdapter();
  const locale = LOCALE_MAP[language] ?? 'en-GB';
  return (amount: number) => formatAmount(amount, currency, locale);
}
