export function formatPrice(cents: number): string {
  const cordobas = cents / 100
  return `C$ ${cordobas.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
