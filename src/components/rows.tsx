import { useState, type ReactNode } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { resolveImageUrl } from '@/utils/errors'
import { formatPrice } from '@/utils/currency'
import { daysBetween, formatDateRange, formatDays } from '@/utils/dates'
import { StatusBadge } from '@/components/fields'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/constants/payment-ui'
import { STATUS_LABELS, STATUS_TONES } from '@/constants/reservation-ui'
import type { Car } from '@/types/car'
import type { Reservation } from '@/types/reservation'

export function CarPhoto({
  uri,
  name,
  variant = 'card',
}: {
  uri?: string
  name: string
  variant?: 'card' | 'row'
}) {
  const [failed, setFailed] = useState(false)
  const resolved = resolveImageUrl(uri)
  const isRow = variant === 'row'
  const box = isRow ? 'h-16 w-16' : 'aspect-[3/2] w-full'
  const initial = name ? name[0] : '?'

  if (!resolved || failed) {
    return (
      <View
        className={`${box} items-center justify-center overflow-hidden rounded-lg bg-muted`}
      >
        <Text
          className={`font-bold text-muted-foreground ${
            variant === 'card' ? 'text-4xl' : 'text-xl'
          }`}
        >
          {initial}
        </Text>
      </View>
    )
  }

  return (
    <View className={`${box} overflow-hidden rounded-lg bg-muted`}>
      <Image
        className="h-full w-full"
        source={{ uri: resolved }}
        resizeMode="cover"
        accessible={false}
        onError={() => setFailed(true)}
      />
    </View>
  )
}

export function CarCard({
  car,
  onPress,
  footer,
}: {
  car: Car
  onPress?: () => void
  footer?: ReactNode
}) {
  const body = (
    <View
      className="flex-1 gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
      style={{ maxWidth: 360 }}
    >
      <CarPhoto uri={car.photo_url} name={car.name} />
      <View className="flex-1 gap-1">
        <Text numberOfLines={1} className="text-base font-bold text-foreground">
          {car.name}
        </Text>
        <Text className="text-sm font-semibold text-foreground">
          {formatPrice(car.price_per_day)} / día
        </Text>
      </View>
      {footer}
    </View>
  )

  if (!onPress) return body

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-1"
      style={{ maxWidth: 360 }}
    >
      {body}
    </Pressable>
  )
}

export function CarRow({
  car,
  meta,
  trailing,
}: {
  car: Car
  meta?: ReactNode
  trailing?: ReactNode
}) {
  return (
    <View className="flex-row items-center gap-3">
      <CarPhoto uri={car.photo_url} name={car.name} variant="row" />
      <View className="flex-1 gap-1">
        <Text numberOfLines={2} className="text-base font-bold text-foreground">
          {car.name}
        </Text>
        <Text className="text-sm font-semibold text-foreground">
          {formatPrice(car.price_per_day)} / día
        </Text>
        {meta}
      </View>
      {trailing}
    </View>
  )
}

const COLUMN = {
  car: 'flex-1 min-w-0',
  dates: 'w-48',
  total: 'w-24',
  status: 'w-44',
  action: 'w-40 items-end',
} as const

export function ReservationColumns() {
  return (
    <View className="flex-row items-center gap-4 border-b border-border px-4 py-2">
      <Text className={`${COLUMN.car} text-xs font-semibold text-muted-foreground`}>
        Auto
      </Text>
      <Text className={`${COLUMN.dates} text-xs font-semibold text-muted-foreground`}>
        Fechas
      </Text>
      <Text className={`${COLUMN.total} text-xs font-semibold text-muted-foreground`}>
        Total
      </Text>
      <Text className={`${COLUMN.status} text-xs font-semibold text-muted-foreground`}>
        Estado
      </Text>
      <View className={COLUMN.action} />
    </View>
  )
}

function paymentLine(reservation: Reservation) {
  if (!reservation.payment) return 'Sin pago registrado'
  return `Pago ${PAYMENT_METHOD_LABELS[reservation.payment.method]} · ${
    PAYMENT_STATUS_LABELS[reservation.payment.status]
  }`
}

function reservationTotal(reservation: Reservation) {
  const days = daysBetween(reservation.start_date, reservation.end_date)
  return {
    days,
    total: days * reservation.car.price_per_day,
  }
}

export function ReservationRow({
  reservation,
  action,
  columns = false,
}: {
  reservation: Reservation
  action?: ReactNode
  columns?: boolean
}) {
  const { days, total } = reservationTotal(reservation)
  const badge = (
    <StatusBadge tone={STATUS_TONES[reservation.status]}>
      {STATUS_LABELS[reservation.status]}
    </StatusBadge>
  )

  if (columns) {
    return (
      <View className="flex-row items-center gap-4 px-4 py-3">
        <View className={`${COLUMN.car} flex-row items-center gap-3`}>
          <CarPhoto
            uri={reservation.car.photo_url}
            name={reservation.car.name}
            variant="row"
          />
          <View className="flex-1 gap-1">
            <Text
              numberOfLines={1}
              className="text-base font-bold text-foreground"
            >
              {reservation.car.name}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {formatPrice(reservation.car.price_per_day)} / día
            </Text>
          </View>
        </View>
        <View className={COLUMN.dates}>
          <Text className="text-sm text-foreground">
            {formatDateRange(reservation.start_date, reservation.end_date)}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {formatDays(days)}
          </Text>
        </View>
        <Text className={`${COLUMN.total} text-sm font-semibold text-foreground`}>
          {formatPrice(total)}
        </Text>
        <View className={`${COLUMN.status} gap-1`}>
          {badge}
          <Text numberOfLines={1} className="text-xs text-muted-foreground">
            {paymentLine(reservation)}
          </Text>
        </View>
        <View className={COLUMN.action}>{action}</View>
      </View>
    )
  }

  return (
    <View className="gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
      <View className="flex-row items-start gap-3">
        <CarPhoto
          uri={reservation.car.photo_url}
          name={reservation.car.name}
          variant="row"
        />
        <View className="flex-1 gap-1">
          <Text
            numberOfLines={2}
            className="text-base font-bold text-foreground"
          >
            {reservation.car.name}
          </Text>
          <Text className="text-sm text-foreground">
            {formatDateRange(reservation.start_date, reservation.end_date)}
          </Text>
        </View>
        {badge}
      </View>
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-xs text-muted-foreground">
          {formatDays(days)} · {paymentLine(reservation)}
        </Text>
        <Text className="text-sm font-semibold text-foreground">
          {formatPrice(total)}
        </Text>
      </View>
      {action}
    </View>
  )
}
