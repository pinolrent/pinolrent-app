export const CENTS_PER_DOLLAR = 100

export function formatUSD(cents: number): string {
  const dollars = cents / CENTS_PER_DOLLAR
  return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatPrice = formatUSD
