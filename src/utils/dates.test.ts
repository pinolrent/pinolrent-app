import { describe, expect, it, vi } from 'vitest'
import {
  daysBetween,
  formatApiTimestamp,
  formatDate,
  formatDateRange,
  formatDays,
  toISO,
  todayISO,
  todayDate,
  validateDateRangeInput,
} from './dates'

describe('formatDate', () => {
  it('formats YYYY-MM-DD as DD/MM/YYYY', () => {
    expect(formatDate('2026-10-01')).toBe('01/10/2026')
  })
})

describe('formatDateRange', () => {
  it('joins both ends of the range with an arrow', () => {
    expect(formatDateRange('2026-09-20', '2026-09-22')).toBe(
      '20/09/2026 → 22/09/2026'
    )
  })
})

describe('formatDays', () => {
  it('uses the singular for one day', () => {
    expect(formatDays(1)).toBe('1 día')
  })

  it('uses the plural for any other count', () => {
    expect(formatDays(3)).toBe('3 días')
  })
})

describe('toISO', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toISO(new Date(2026, 9, 5))).toBe('2026-10-05')
  })
})

describe('todayISO', () => {
  it('cuenta el día en la zona de negocio (UTC-6)', () => {
    // 03:00 UTC del 5 de octubre en Managua todavía es el 4.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-05T03:00:00Z'))
    expect(todayISO()).toBe('2026-10-04')
    vi.setSystemTime(new Date('2026-10-05T07:00:00Z'))
    expect(todayISO()).toBe('2026-10-05')
    vi.useRealTimers()
  })
})

describe('todayDate', () => {
  it('da el mismo día de negocio que todayISO', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-05T03:00:00Z'))
    expect(toISO(todayDate())).toBe('2026-10-04')
    vi.useRealTimers()
  })
})

describe('formatApiTimestamp', () => {
  it('pasa un created_at UTC sin zona a la zona de negocio', () => {
    expect(formatApiTimestamp('2026-10-03 15:12:04')).toBe('03/10/2026 09:12')
  })

  it('cruza el día cuando corresponde', () => {
    expect(formatApiTimestamp('2026-10-04 02:30:00')).toBe('03/10/2026 20:30')
  })

  it('devuelve el valor original si no lo entiende', () => {
    expect(formatApiTimestamp('ayer')).toBe('ayer')
  })
})

describe('daysBetween', () => {
  it('counts exclusive days (02/11 to 04/11 is 2)', () => {
    expect(daysBetween('2026-11-02', '2026-11-04')).toBe(2)
  })

  it('same day is zero', () => {
    expect(daysBetween('2026-11-02', '2026-11-02')).toBe(0)
  })
})

describe('validateDateRangeInput', () => {
  it('deja pasar el par vacío y el par completo', () => {
    expect(validateDateRangeInput('', '')).toEqual({ startError: null, endError: null })
    expect(validateDateRangeInput('2026-10-01', '2026-10-05')).toEqual({
      startError: null,
      endError: null,
    })
  })

  it('pide completar el par', () => {
    expect(validateDateRangeInput('2026-10-01', '').endError).toBe(
      'Elige también la fecha de fin'
    )
    expect(validateDateRangeInput('', '2026-10-05').startError).toBe(
      'Elige también la fecha de inicio'
    )
  })

  it('rechaza formatos y órdenes inválidos', () => {
    expect(validateDateRangeInput('nope', '2026-10-05').startError).toBe(
      'Selecciona una fecha válida'
    )
    expect(validateDateRangeInput('2026-10-01', 'nope').endError).toBe(
      'Selecciona una fecha válida'
    )
    expect(validateDateRangeInput('2026-10-05', '2026-10-01').endError).toBe(
      'La fecha de fin tiene que ser posterior a la de inicio'
    )
  })
})
