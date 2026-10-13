// Debe coincidir con BUSINESS_TIMEZONE del API, que decide el día para
// aceptar reservas. Managua es UTC-6 todo el año, sin horario de verano: si
// la instalación cambia de zona, este offset tiene que seguirlo.
const BUSINESS_TZ_OFFSET_HOURS = -6

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

export function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} → ${formatDate(end)}`
}

export function formatDays(days: number): string {
  return `${days} ${days === 1 ? 'día' : 'días'}`
}

export function toISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// El API decide el día en BUSINESS_TIMEZONE (Managua, UTC-6 sin horario de
// verano): acá se replica para no ofrecer fechas que va a rechazar.
export function todayISO(): string {
  const shifted = new Date(Date.now() + BUSINESS_TZ_OFFSET_HOURS * 3600 * 1000)
  return shifted.toISOString().slice(0, 10)
}

// Los created_at del API son UTC sin zona ("2026-10-03 15:12:04"); se
// muestran en la zona de negocio.
export function formatApiTimestamp(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(value.trim())
  if (!match) return value
  const [, year, month, day, hour, minute] = match
  const utc = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  )
  const local = new Date(utc + BUSINESS_TZ_OFFSET_HOURS * 3600 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(local.getUTCDate())}/${pad(local.getUTCMonth() + 1)}/${local.getUTCFullYear()} ${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`
}

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

export function isValidISODate(value: string): boolean {
  if (!ISO_RE.test(value)) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return date.toISOString().slice(0, 10) === value
}

export function daysBetween(start: string, end: string): number {
  const s = new Date(`${start}T00:00:00Z`).getTime()
  const e = new Date(`${end}T00:00:00Z`).getTime()
  return Math.round((e - s) / 86400000)
}

export interface DateRangeInputErrors {
  startError: string | null
  endError: string | null
}

// Las mismas reglas para la búsqueda del inicio y los filtros del catálogo,
// así no pueden divergir.
export function validateDateRangeInput(
  start: string,
  end: string
): DateRangeInputErrors {
  const from = start.trim()
  const to = end.trim()
  const valid: DateRangeInputErrors = { startError: null, endError: null }
  if (!from && !to) return valid
  if (from && !isValidISODate(from)) {
    return { startError: 'Selecciona una fecha válida', endError: null }
  }
  if (to && !isValidISODate(to)) {
    return { startError: null, endError: 'Selecciona una fecha válida' }
  }
  if (from && !to) {
    return { startError: null, endError: 'Elige también la fecha de fin' }
  }
  if (!from && to) {
    return { startError: 'Elige también la fecha de inicio', endError: null }
  }
  if (to < from) {
    return {
      startError: null,
      endError: 'La fecha de fin tiene que ser posterior a la de inicio',
    }
  }
  return valid
}
