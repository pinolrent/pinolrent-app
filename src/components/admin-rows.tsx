import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import { useThemeColors } from '@/hooks/useThemeColors'
import { AppPressable } from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { ProofLink } from '@/components/ProofLink'
import { CarPhoto } from '@/components/rows'
import { formatPricePerDay } from '@/utils/currency'
import { formatApiTimestamp, formatDateRange } from '@/utils/dates'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
} from '@/constants/payment-ui'
import { STATUS_LABELS, STATUS_TONES } from '@/constants/reservation-ui'
import {
  AUDIT_ACTION_LABELS,
  ROLE_LABELS,
  auditTargetLabel,
} from '@/constants/admin-ui'
import { NUMERIC } from '@/constants/typography'
import type {
  AdminCar,
  AdminPayment,
  AdminReservation,
  AdminUser,
  AuditEntry,
} from '@/types/admin'

function rowClassName(last?: boolean) {
  return `min-h-20 flex-row items-center gap-3 border-border bg-card px-4 py-3 ${
    last ? '' : 'border-b'
  }`
}

export function AdminUserRow({
  user,
  onPress,
  last,
}: {
  user: AdminUser
  onPress?: () => void
  last?: boolean
}) {
  const colors = useThemeColors()

  return (
    <AppPressable
      accessibilityRole="button"
      accessibilityLabel={`Cuenta de ${user.email}`}
      onPress={onPress}
      hoverClassName="bg-accent"
      className={rowClassName(last)}
    >
      <View className="flex-1 gap-2">
        <Text numberOfLines={1} className="text-base font-semibold text-foreground">
          {user.email}
        </Text>
        <View className="flex-row flex-wrap items-center gap-2">
          {user.roles.map((role) => (
            <StatusBadge key={role} tone="muted">
              {ROLE_LABELS[role]}
            </StatusBadge>
          ))}
          {user.suspended_at ? (
            <StatusBadge tone="destructive">Suspendida</StatusBadge>
          ) : null}
        </View>
      </View>
      {user.phone ? (
        <Text style={NUMERIC} className="text-sm text-muted-foreground">
          {user.phone}
        </Text>
      ) : null}
      <ChevronRight size={20} color={colors.mutedText} />
    </AppPressable>
  )
}

export function AdminCarRow({
  car,
  onPress,
  last,
}: {
  car: AdminCar
  onPress?: () => void
  last?: boolean
}) {
  const colors = useThemeColors()

  return (
    <AppPressable
      accessibilityRole="button"
      accessibilityLabel={`Auto ${car.name}`}
      onPress={onPress}
      hoverClassName="bg-accent"
      className={rowClassName(last)}
    >
      <CarPhoto uri={car.photo_url} name={car.name} variant="row" />
      <View className="flex-1 gap-1">
        <Text numberOfLines={1} className="text-base font-semibold text-foreground">
          {car.name}
        </Text>
        <Text style={NUMERIC} className="text-sm text-muted-foreground">
          {formatPricePerDay(car.price_per_day)}
        </Text>
        {car.owner_email ? (
          <Text numberOfLines={1} className="text-xs text-muted-foreground">
            {car.owner_email}
          </Text>
        ) : null}
      </View>
      <StatusBadge tone={car.active ? 'success' : 'muted'}>
        {car.active ? 'Activo' : 'Inactivo'}
      </StatusBadge>
      <ChevronRight size={20} color={colors.mutedText} />
    </AppPressable>
  )
}

export function AdminReservationRow({
  reservation,
  action,
  last,
}: {
  reservation: AdminReservation
  action?: ReactNode
  last?: boolean
}) {
  return (
    <View className={last ? '' : 'border-b border-border'}>
      <View className="min-h-20 flex-row items-center gap-3 bg-card px-4 py-3">
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <StatusBadge tone={STATUS_TONES[reservation.status]}>
              {STATUS_LABELS[reservation.status]}
            </StatusBadge>
            <Text
              numberOfLines={1}
              className="flex-1 text-base font-semibold text-foreground"
            >
              {reservation.car_name ?? `Auto #${reservation.car_id}`}
            </Text>
          </View>
          <Text className="text-xs text-muted-foreground">
            Reserva #{reservation.id} ·{' '}
            {formatDateRange(reservation.start_date, reservation.end_date)}
          </Text>
          {reservation.buyer_email ? (
            <Text numberOfLines={1} className="text-xs text-muted-foreground">
              {reservation.buyer_email}
            </Text>
          ) : null}
        </View>
      </View>
      {action ? (
        <View className="flex-row items-center gap-2 border-t border-border bg-muted/40 px-4 py-3">
          {action}
        </View>
      ) : null}
    </View>
  )
}

export function AdminPaymentRow({
  payment,
  last,
}: {
  payment: AdminPayment
  last?: boolean
}) {
  const context = [
    `Pago #${payment.id}`,
    `Reserva #${payment.reservation_id}`,
    payment.car_id ? `Auto #${payment.car_id}` : null,
    payment.buyer_email ?? null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <View className={rowClassName(last)}>
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <StatusBadge tone={PAYMENT_STATUS_TONES[payment.status]}>
            {PAYMENT_STATUS_LABELS[payment.status]}
          </StatusBadge>
          <Text className="text-base font-semibold text-foreground">
            {PAYMENT_METHOD_LABELS[payment.method]}
          </Text>
        </View>
        <Text numberOfLines={1} className="text-xs text-muted-foreground">
          {context}
        </Text>
      </View>
      <ProofLink url={payment.proof_url} />
    </View>
  )
}

export function AdminAuditRow({
  entry,
  last,
}: {
  entry: AuditEntry
  last?: boolean
}) {
  return (
    <View className={rowClassName(last)}>
      <View className="flex-1 gap-1">
        <Text className="text-base font-semibold text-foreground">
          {AUDIT_ACTION_LABELS[entry.action] ?? entry.action}
        </Text>
        <Text numberOfLines={1} className="text-xs text-muted-foreground">
          {auditTargetLabel(entry)} ·{' '}
          {entry.actor_email || `Cuenta #${entry.actor_id}`}
        </Text>
      </View>
      <Text style={NUMERIC} className="text-xs text-muted-foreground">
        {formatApiTimestamp(entry.created_at)}
      </Text>
    </View>
  )
}
