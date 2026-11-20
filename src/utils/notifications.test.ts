import { describe, expect, it } from 'vitest'
import type { NotificationKind } from '@/types/notification'
import {
  isNotificationNavigable,
  notificationAction,
  notificationTarget,
} from './notifications'

const R = 42
const SELLER_DETAIL = '/(authenticated)/seller/reservations/42'
const BUYER_DETAIL = '/(authenticated)/(buyer)/reservations/42'
const BUYER_PAY_STEP = {
  pathname: '/(authenticated)/(buyer)/reservations/[id]',
  params: { id: R, step: 'payment' },
} as const

const OWNER_SIDE: NotificationKind[] = [
  'reservation.requested',
  'reservation.cancelled',
]
// Los dos avisos que piden un comprobante abren la reserva con el paso de pago
// desplegado; el resto, la reserva tal cual.
const BUYER_SIDE: NotificationKind[] = ['reservation.rejected']
const BUYER_SIDE_WITH_PAY_STEP: NotificationKind[] = [
  'reservation.accepted',
  'reservation.correction_requested',
]

describe('notificationTarget', () => {
  it('owner-side events point at the seller reservation', () => {
    for (const kind of OWNER_SIDE) {
      expect(notificationTarget(kind, 'buyer', R)).toBe(SELLER_DETAIL)
      expect(notificationTarget(kind, 'seller', R)).toBe(SELLER_DETAIL)
    }
  })

  it('buyer-side events point at the buyer reservation', () => {
    for (const kind of BUYER_SIDE) {
      expect(notificationTarget(kind, 'buyer', R)).toEqual(BUYER_DETAIL)
      expect(notificationTarget(kind, 'seller', R)).toEqual(BUYER_DETAIL)
    }
  })

  it('the proof requests open the reservation at the payment step', () => {
    for (const kind of BUYER_SIDE_WITH_PAY_STEP) {
      expect(notificationTarget(kind, 'buyer', R)).toEqual(BUYER_PAY_STEP)
    }
    expect(notificationTarget('reservation.rejected', 'buyer', R)).toBe(
      BUYER_DETAIL
    )
  })

  it('confirmed follows the current area', () => {
    expect(notificationTarget('reservation.confirmed', 'buyer', R)).toBe(
      BUYER_DETAIL
    )
    expect(notificationTarget('reservation.confirmed', 'seller', R)).toBe(
      SELLER_DETAIL
    )
  })

  it('admin never navigates', () => {
    const all: NotificationKind[] = [
      'reservation.requested',
      'reservation.accepted',
      'reservation.rejected',
      'reservation.confirmed',
      'reservation.correction_requested',
      'reservation.cancelled',
      'reservation.correction_submitted',
    ]
    for (const kind of all) {
      expect(notificationTarget(kind, 'admin', R)).toBeNull()
    }
  })

  it('isNotificationNavigable reflects navigation', () => {
    expect(isNotificationNavigable('reservation.requested', 'buyer')).toBe(true)
    expect(
      isNotificationNavigable('reservation.accepted', 'seller')
    ).toBe(true)
    expect(isNotificationNavigable('reservation.confirmed', 'admin')).toBe(
      false
    )
  })
})

describe('notificationAction', () => {
  it('asks the seller to answer a new request', () => {
    expect(notificationAction('reservation.requested', 'seller')).toEqual({
      label: 'Aceptá o rechazá la solicitud',
      action: true,
    })
  })

  it('asks the buyer for the proof when the reservation is accepted', () => {
    expect(notificationAction('reservation.accepted', 'buyer')).toEqual({
      label: 'Subí el comprobante de pago',
      action: true,
    })
    expect(notificationAction('reservation.correction_requested', 'buyer')).toEqual(
      {
        label: 'Subí un comprobante nuevo',
        action: true,
      }
    )
  })

  it('names the other party when the reservation is confirmed', () => {
    expect(notificationAction('reservation.confirmed', 'buyer')?.label).toContain(
      'con el vendedor'
    )
    expect(notificationAction('reservation.confirmed', 'seller')?.label).toContain(
      'con el comprador'
    )
    expect(notificationAction('reservation.confirmed', 'buyer')?.action).toBe(
      false
    )
  })

  it('leaves no action on closed events', () => {
    expect(notificationAction('reservation.rejected', 'buyer')?.action).toBe(
      false
    )
    expect(notificationAction('reservation.cancelled', 'seller')?.action).toBe(
      false
    )
  })

  it('only points admins at a new proof to validate', () => {
    expect(notificationAction('reservation.correction_submitted', 'admin')).toEqual(
      {
        label: 'Hay un comprobante nuevo para validar',
        action: true,
      }
    )
    expect(notificationAction('reservation.requested', 'admin')).toBeNull()
  })

  it('has nothing to say on an admin-side correction submission', () => {
    expect(
      notificationAction('reservation.correction_submitted', 'buyer')
    ).toBeNull()
  })
})
