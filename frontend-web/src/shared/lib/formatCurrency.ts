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
