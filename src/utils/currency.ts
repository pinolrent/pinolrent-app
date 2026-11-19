const CENTS_PER_DOLLAR = 100

export function formatUSD(cents: number): string {
  const { sign, grouped, rest } = split(cents)
  const decimals = rest === 0 ? '' : `,${String(rest).padStart(2, '0')}`
  return `${sign}US$${grouped}${decimals}`
}

// Importes en columnas de ancho fijo (tablas y desglose): con los centavos
// omitidos cuando son cero, un renglón dice US$1.900 y el de al lado
// US$1.026,80, y la columna deja de leerse de arriba abajo.
export function formatUSDExact(cents: number): string {
  const { sign, grouped, rest } = split(cents)
  return `${sign}US$${grouped},${String(rest).padStart(2, '0')}`
}

function split(cents: number) {
  const absolute = Math.abs(Math.round(cents))
  return {
    sign: cents < 0 ? '-' : '',
    grouped: String(Math.floor(absolute / CENTS_PER_DOLLAR)).replace(
      /\B(?=(\d{3})+(?!\d))/g,
      '.'
    ),
    rest: absolute % CENTS_PER_DOLLAR,
  }
}

export const formatPrice = formatUSD

export function formatPricePerDay(cents: number): string {
  return `${formatUSD(cents)} / día`
}
