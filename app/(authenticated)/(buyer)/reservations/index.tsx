import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useMyReservations } from '@/hooks/useReservations'
import type { Reservation } from '@/types/reservation'
import { STATUS_LABELS, STATUS_TONES } from '@/constants/reservation-ui'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/constants/payment-ui'
import { formatPrice } from '@/utils/currency'
import { daysBetween, formatDate } from '@/utils/dates'
import { getApiErrorMessage } from '@/utils/errors'
import { AppButton, AppCard, EmptyState } from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { SkeletonList } from '@/components/Skeleton'


export default function ReservationsScreen() {
  const router = useRouter()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useMyReservations()

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar las reservas')
    : null

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <SkeletonList count={4} />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background p-4">
        <Text className="text-muted-foreground">{errorMessage}</Text>
        <AppButton onPress={() => refetch()}>Reintentar</AppButton>
      </View>
    )
  }

  const renderItem = ({ item }: { item: Reservation }) => (
    <AppCard>
      <Link
        href={`/(authenticated)/(buyer)/reservations/${item.id}`}
        asChild
      >
        <Pressable accessibilityRole="button">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="flex-1 text-base font-bold text-foreground">
              {item.car.name}
            </Text>
            <StatusBadge tone={STATUS_TONES[item.status]}>
              {STATUS_LABELS[item.status]}
            </StatusBadge>
          </View>
          <Text className="text-muted-foreground">
            {formatDate(item.start_date)} – {formatDate(item.end_date)}
          </Text>
          <Text className="text-sm text-foreground">
            {formatPrice(item.car.price_per_day)} / día · Total{' '}
            {formatPrice(daysBetween(item.start_date, item.end_date) * item.car.price_per_day)}
          </Text>
          {item.payment && (
            <Text className="text-muted-foreground">
              Pago: {PAYMENT_METHOD_LABELS[item.payment.method]} ·{' '}
              {PAYMENT_STATUS_LABELS[item.payment.status]}
            </Text>
          )}
          {item.status === 'pending' && !item.payment && (
            <Text className="text-sm text-primary">Gestionar pago →</Text>
          )}
        </Pressable>
      </Link>
    </AppCard>
  )

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, gap: 12 }}
      data={data ?? []}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
      }
      ListEmptyComponent={
        <EmptyState
          message="No has hecho ninguna reserva"
          action={
            <AppButton
              onPress={() => router.push('/(authenticated)/(buyer)/catalog')}
            >
              Explorar autos
            </AppButton>
          }
        />
      }
    />
  )
}
