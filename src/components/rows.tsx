import { useState, type ReactNode } from 'react'
import { Image, Text, View } from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import { resolveImageUrl } from '@/utils/errors'
import { useThemeColors } from '@/hooks/useThemeColors'
import { formatPricePerDay, formatUSD, formatUSDExact } from '@/utils/currency'
import { formatDateRange, formatDays, formatApiTimestamp } from '@/utils/dates'
import { reservationPricing } from '@/utils/reservations'
import { StatusBadge } from '@/components/fields'
import { AppPressable, CARD_SURFACE, rowSurface } from '@/components/ui-kit'
import { DISPLAY, NUMERIC } from '@/constants/typography'
import { CARD_WIDTH } from '@/constants/layout'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/constants/payment-ui'
import {
  SELLER_NET_LABEL,
  STATUS_LABELS,
  STATUS_TONES,
} from '@/constants/reservation-ui'
import type { Car } from '@/types/car'
import type { Notification } from '@/types/notification'
import type { Reservation } from '@/types/reservation'
import { NOTIFICATION_LABELS } from '@/constants/notification-ui'
import { notificationAction, type NotificationArea } from '@/utils/notifications'

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

const CAR_CARD_CLASS = `flex-1 gap-3 p-3 ${CARD_SURFACE}`
const CAR_CARD_STYLE = { maxWidth: CARD_WIDTH }

export function CarCard({
  car,
  onPress,
  footer,
}: {
  car: Car
  onPress?: () => void
  footer?: ReactNode
}) {
  const content = (
    <>
      <CarPhoto uri={car.photo_url} name={car.name} />
      <View className="flex-1 gap-1">
        <Text
          numberOfLines={2}
          style={DISPLAY}
          className="text-lg font-bold text-foreground"
        >
          {car.name}
        </Text>
        <Text style={NUMERIC} className="text-sm font-semibold text-foreground">
          {formatPricePerDay(car.price_per_day)}
        </Text>
      </View>
      {footer}
    </>
  )

  if (!onPress) {
    return (
      <View className={CAR_CARD_CLASS} style={CAR_CARD_STYLE}>
        {content}
      </View>
    )
  }

  return (
    <AppPressable
      accessibilityRole="button"
      accessibilityLabel={car.name}
      onPress={onPress}
      hoverClassName="border-primary/40"
      className={CAR_CARD_CLASS}
      style={CAR_CARD_STYLE}
    >
      {content}
    </AppPressable>
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
        <Text
          numberOfLines={2}
          style={DISPLAY}
          className="text-lg font-bold text-foreground"
        >
          {car.name}
        </Text>
        <Text style={NUMERIC} className="text-sm font-semibold text-foreground">
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
  first = false,
  last = false,
  meta,
}: {
  car: Car
  onPress?: () => void
  first?: boolean
  last?: boolean
  meta?: ReactNode
}) {
  const colors = useThemeColors()

  return (
    <AppPressable
      accessibilityRole="button"
      accessibilityLabel={`${car.name}, ${formatPricePerDay(car.price_per_day)}`}
      onPress={onPress}
      hoverClassName="bg-accent"
      className={`min-h-20 flex-row items-center gap-3 px-4 py-3 ${rowSurface(
        first,
        last
      )}`}
    >
      <CarPhoto uri={car.photo_url} name={car.name} variant="row" />
      <View className="flex-1 gap-1">
        <Text
          numberOfLines={1}
          style={DISPLAY}
          className="text-lg font-semibold text-foreground"
        >
          {car.name}
        </Text>
        {meta}
      </View>
      {/* El precio va al extremo derecho, como en la tabla de reservas: en
          escritorio la fila mide más de mil píxeles y con todo el dato pegado
          a la izquierda el resto era aire. */}
      <View className="items-end">
        <Text style={NUMERIC} className="text-base font-semibold text-foreground">
          {formatUSD(car.price_per_day)}
        </Text>
        <Text className="text-xs text-muted-foreground">por día</Text>
      </View>
      <ChevronRight size={20} color={colors.mutedText} />
    </AppPressable>
  )
}

const COLUMN = {
  car: 'flex-1 min-w-0',
  dates: 'w-48',
  // 128px: "US$12.345,60" mide 110 a 14px semibold con cifras tabulares; con
  // w-24 (96) el monto se partía en dos renglones.
  total: 'w-32 text-right',
  status: 'w-44',
  action: 'w-40 items-end',
} as const

export function ReservationColumns({
  audience,
  first = true,
}: {
  audience: 'buyer' | 'seller'
  first?: boolean
}) {
  return (
    <View
      className={`flex-row items-center gap-4 border-x border-t border-b border-border bg-card px-4 py-2 ${
        first ? 'rounded-t-xl' : ''
      }`}
    >
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
        {audience === 'seller' ? SELLER_NET_LABEL : 'Total'}
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

export function ReservationRow({
  reservation,
  action,
  onPress,
  columns = false,
  audience,
  first = false,
  last = false,
}: {
  reservation: Reservation
  action?: ReactNode
  onPress?: () => void
  columns?: boolean
  audience: 'buyer' | 'seller'
  first?: boolean
  last?: boolean
}) {
  const colors = useThemeColors()
  const pricing = reservationPricing(
    reservation.start_date,
    reservation.end_date,
    reservation.car.price_per_day
  )
  const { days } = pricing
  const amount = formatUSDExact(
    audience === 'seller' ? pricing.sellerNet : pricing.buyerTotal
  )
  const badge = (
    <StatusBadge tone={STATUS_TONES[reservation.status]}>
      {STATUS_LABELS[reservation.status]}
    </StatusBadge>
  )

  if (columns) {
    // La tabla se navega con la acción de la fila (el link "Ver detalle"), así
    // que la fila entera sólo es un botón cuando no hay acción adentro: dos
    // controles anidados confunden al lector de pantalla y al dedo.
    const Row = action ? View : onPress ? AppPressable : View
    const rowProps =
      !action && onPress
        ? {
            accessibilityRole: 'button' as const,
            accessibilityLabel: `Ver la reserva de ${reservation.car.name}, ${formatDateRange(reservation.start_date, reservation.end_date)}, ${STATUS_LABELS[reservation.status]}`,
            onPress,
            hoverClassName: 'bg-accent',
          }
        : {}

    return (
      <Row
        {...rowProps}
        className={`flex-row items-center gap-4 px-4 py-3 ${rowSurface(first, last)}`}
      >
        <View className={`${COLUMN.car} flex-row items-center gap-3`}>
          <CarPhoto
            uri={reservation.car.photo_url}
            name={reservation.car.name}
            variant="row"
          />
          <View className="flex-1 gap-1">
            <Text
              numberOfLines={1}
              style={DISPLAY}
              className="text-lg font-bold text-foreground"
            >
              {reservation.car.name}
            </Text>
            <Text style={NUMERIC} className="text-sm text-muted-foreground">
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
          numberOfLines={1}
          style={NUMERIC}
          className={`${COLUMN.total} text-sm font-semibold text-foreground`}
        >
          {amount}
        </Text>
        <View className={`${COLUMN.status} gap-1`}>
          {badge}
          <Text numberOfLines={1} className="text-xs text-muted-foreground">
            {paymentLine(reservation)}
          </Text>
        </View>
        <View className={COLUMN.action}>
          {action ??
            (onPress ? (
              // Sin acción propia, la fila se abre con el chevron: la columna
              // no queda vacía.
              <ChevronRight size={20} color={colors.mutedText} />
            ) : null)}
        </View>
      </Row>
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
            style={DISPLAY}
            className="text-lg font-bold text-foreground"
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
          <Text style={NUMERIC} className="text-sm font-semibold text-foreground">
            {amount}
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

export function NotificationRow({
  notification,
  area,
  onPress,
  first,
  last,
}: {
  notification: Notification
  area: NotificationArea
  onPress?: () => void
  first?: boolean
  last?: boolean
}) {
  const colors = useThemeColors()
  const unread = !notification.read
  const step = notificationAction(notification.kind, area)
  const body = (
    <View className="flex-1 gap-1">
      <View className="flex-row items-center gap-3">
        {unread ? (
          <View className="h-2 w-2 rounded-full bg-primary" />
        ) : (
          <View className="w-4" />
        )}
        <Text
          numberOfLines={1}
          className={`text-base ${
            unread ? 'font-semibold' : ''
          } text-foreground`}
        >
          {NOTIFICATION_LABELS[notification.kind]}
        </Text>
      </View>
      <Text className="text-xs text-muted-foreground">
        Reserva #{notification.reservation_id} ·{' '}
        {formatApiTimestamp(notification.created_at)}
      </Text>
      {/* El aviso dice qué pasó; esto dice qué sigue, y va en semibold
          cuando el paso depende de quien lo recibe. */}
      {step ? (
        <Text
          className={
            step.action
              ? 'text-sm font-semibold text-foreground'
              : 'text-sm text-muted-foreground'
          }
        >
          {step.label}
        </Text>
      ) : null}
    </View>
  )

  const rowClass = `min-h-16 flex-row items-center justify-between gap-3 px-4 py-3 ${rowSurface(first, last)}`

  if (!onPress) {
    return <View className={rowClass}>{body}</View>
  }

  return (
    <AppPressable
      accessibilityRole="button"
      accessibilityLabel={`Notificación: ${NOTIFICATION_LABELS[notification.kind]}`}
      onPress={onPress}
      hoverClassName="bg-accent"
      className={rowClass}
    >
      {body}
      <ChevronRight size={20} color={colors.mutedText} />
    </AppPressable>
  )
}
