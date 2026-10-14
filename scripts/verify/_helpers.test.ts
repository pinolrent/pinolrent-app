import { afterEach, describe, expect, it, vi } from 'vitest'
import { isoDaysFromNow } from './_helpers'

describe('isoDaysFromNow', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('cuenta los días en la zona de negocio (UTC-6), no en UTC', () => {
    // 00:19 UTC del 14 de octubre en Managua todavía es el 13: contar en UTC
    // hacía que "ayer" (-1) fuera el 13, que para el API es hoy, y el check
    // de fechas pasadas del flow de reservas fallaba.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-14T00:19:00Z'))
    expect(isoDaysFromNow(0)).toBe('2026-10-13')
    expect(isoDaysFromNow(-1)).toBe('2026-10-12')
    expect(isoDaysFromNow(1)).toBe('2026-10-14')
  })
})
