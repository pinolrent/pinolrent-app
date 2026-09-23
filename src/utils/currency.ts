export const CENTS_PER_DOLLAR = 100

export function formatUSD(cents: number): string {
  const negative = cents < 0
  const absolute = Math.abs(Math.round(cents))
  const dollars = Math.floor(absolute / CENTS_PER_DOLLAR)
  const rest = absolute % CENTS_PER_DOLLAR
  const grouped = String(dollars).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const decimals = rest === 0 ? '' : `,${String(rest).padStart(2, '0')}`
  return `${negative ? '-' : ''}US$${grouped}${decimals}`
}

export const formatPrice = formatUSD

export function formatPricePerDay(cents: number): string {
  return `${formatUSD(cents)} / día`
}
