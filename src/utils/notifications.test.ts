import { describe, expect, it } from 'vitest'
import type { NotificationKind } from '@/types/notification'
import { isNotificationNavigable, notificationTarget } from './notifications'

const R = 42
const SELLER_DETAIL = '/(authenticated)/seller/reservations/42'
const BUYER_DETAIL = '/(authenticated)/(buyer)/reservations/42'

const OWNER_SIDE: NotificationKind[] = [
  'reservation.requested',
  'reservation.cancelled',
]
const BUYER_SIDE: NotificationKind[] = [
  'reservation.accepted',
  'reservation.rejected',
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
      expect(notificationTarget(kind, 'buyer', R)).toBe(BUYER_DETAIL)
      expect(notificationTarget(kind, 'seller', R)).toBe(BUYER_DETAIL)
    }
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
