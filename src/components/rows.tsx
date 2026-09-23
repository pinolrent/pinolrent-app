import { useState, type ReactNode } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import { resolveImageUrl } from '@/utils/errors'
import { useHover } from '@/hooks/useHover'
import { useThemeColors } from '@/hooks/useThemeColors'
import { formatPrice, formatPricePerDay } from '@/utils/currency'
import { formatDateRange, formatDays } from '@/utils/dates'
import { reservationTotal } from '@/utils/reservations'
import { StatusBadge } from '@/components/fields'
import { AppPressable, CARD_SURFACE } from '@/components/ui-kit'
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
  const { hovered, hoverProps } = useHover()

  const content = (
    <>
      <CarPhoto uri={car.photo_url} name={car.name} />
      <View className="flex-1 gap-1">
        <Text numberOfLines={2} className="text-base font-bold text-foreground">
          {car.name}
        </Text>
        <Text className="text-sm font-semibold text-foreground">
          {formatPricePerDay(car.price_per_day)}
        </Text>
      </View>
      {footer}
    </>
  )

  if (!onPress) {
    return (
      <View
        className={`flex-1 gap-3 p-3 ${CARD_SURFACE}`}
        style={{ maxWidth: 360 }}
      >
        {content}
      </View>
    )
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={car.name}
      onPress={onPress}
      {...hoverProps}
      className={`flex-1 gap-3 p-3 ${CARD_SURFACE} ${
        hovered ? 'border-primary/40' : ''
      }`}
      style={({ pressed }) => [
        { maxWidth: 360 },
        pressed ? { opacity: 0.9 } : null,
      ]}
    >
      {content}
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
          {formatPricePerDay(car.price_per_day)}
        </Text>
        {meta}
      </View>
      {trailing}
    </View>
  )
}

export function CarListRow({
  car,
  onPress,
  last = false,
  meta,
}: {
  car: Car
  onPress?: () => void
  last?: boolean
  meta?: ReactNode
}) {
  const { hovered, hoverProps } = useHover()
  const colors = useThemeColors()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${car.name}, ${formatPricePerDay(car.price_per_day)}`}
      onPress={onPress}
      {...hoverProps}
      className={`min-h-20 flex-row items-center gap-3 border-border bg-card px-4 py-3 ${
        last ? '' : 'border-b'
      } ${hovered ? 'bg-accent' : ''}`}
      style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
    >
      <CarPhoto uri={car.photo_url} name={car.name} variant="row" />
      <View className="flex-1 gap-1">
        <Text
          numberOfLines={1}
          className="text-base font-semibold text-foreground"
        >
          {car.name}
        </Text>
        <Text className="text-sm text-muted-foreground">
          {formatPricePerDay(car.price_per_day)}
        </Text>
        {meta}
      </View>
      <ChevronRight size={20} color={colors.mutedText} />
    </Pressable>
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
      <Text
        className={`${COLUMN.car} text-xs font-semibold text-muted-foreground`}
      >
        Auto
      </Text>
      <Text
        className={`${COLUMN.dates} text-xs font-semibold text-muted-foreground`}
      >
        Fechas
      </Text>
      <Text
        className={`${COLUMN.total} text-xs font-semibold text-muted-foreground`}
      >
        Total
      </Text>
      <Text
        className={`${COLUMN.status} text-xs font-semibold text-muted-foreground`}
      >
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

function reservationTotals(reservation: Reservation) {
  return reservationTotal(
    reservation.start_date,
    reservation.end_date,
    reservation.car.price_per_day
  )
}

export function ReservationRow({
  reservation,
  action,
  onPress,
  columns = false,
}: {
  reservation: Reservation
  action?: ReactNode
  onPress?: () => void
  columns?: boolean
}) {
  const colors = useThemeColors()
  const { days, total } = reservationTotals(reservation)
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
              {formatPricePerDay(reservation.car.price_per_day)}
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
        <Text
          className={`${COLUMN.total} text-sm font-semibold text-foreground`}
        >
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

  const body = (
    <>
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
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-semibold text-foreground">
            {formatPrice(total)}
          </Text>
          {onPress ? <ChevronRight size={20} color={colors.mutedText} /> : null}
        </View>
      </View>
    </>
  )

  return (
    <View className={`gap-3 p-3 ${CARD_SURFACE}`}>
      {onPress ? (
        <AppPressable
          accessibilityRole="button"
          accessibilityLabel={`Ver la reserva de ${reservation.car.name}, ${formatDateRange(reservation.start_date, reservation.end_date)}, ${STATUS_LABELS[reservation.status]}`}
          onPress={onPress}
          className="gap-3"
        >
          {body}
        </AppPressable>
      ) : (
        <View className="gap-3">{body}</View>
      )}
      {action}
    </View>
  )
}
