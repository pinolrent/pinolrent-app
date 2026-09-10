import { useState } from 'react'
import { View, Text, ScrollView, RefreshControl } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useLocalSearchParams } from 'expo-router'
import { useReservation } from '@/hooks/useReservations'
import { STATUS_LABELS, STATUS_TONES } from '@/constants/reservation-ui'
import { formatPrice } from '@/utils/currency'
import { daysBetween, formatDate } from '@/utils/dates'
import { getApiErrorMessage } from '@/utils/errors'
import { AppBackButton } from '@/components/nav-icons'
import { AppButton, AppCard } from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { SkeletonList } from '@/components/Skeleton'
import {
  CancelReservationBlock,
  PayReservationBlock,
  PaymentSummary,
} from '@/components/ReservationActions'


export default function ReservationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const idNum = Number(id)
  const invalidId = !Number.isFinite(idNum)
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useReservation(idNum)
  const [paidMessage, setPaidMessage] = useState<string | null>(null)

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar la reserva')
    : null

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <SkeletonList count={2} />
      </View>
    )
  }

  if (invalidId || isError || !data) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background p-4">
        <Text className="text-muted-foreground">
          {invalidId
            ? 'ID de reserva inválido'
            : (errorMessage ?? 'No se encontró la reserva')}
        </Text>
        {!invalidId && (
          <AppButton onPress={() => refetch()}>Reintentar</AppButton>
        )}
      </View>
    )
  }

  const days = daysBetween(data.start_date, data.end_date)
  const total = days * data.car.price_per_day

  return (
    <Animated.View entering={FadeIn.duration(200)} className="flex-1 bg-background">
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, gap: 12 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
      }
    >
        <AppBackButton />
      <AppCard>
        <View className="flex-row items-center justify-between gap-2">
          <Text className="flex-1 text-2xl font-bold text-foreground">
            {data.car.name}
          </Text>
          <StatusBadge tone={STATUS_TONES[data.status]}>
            {STATUS_LABELS[data.status]}
          </StatusBadge>
        </View>
        <Text className="text-muted-foreground">
          {formatDate(data.start_date)} – {formatDate(data.end_date)} ({days}{' '}
          {days === 1 ? 'día' : 'días'})
        </Text>
        <Text className="text-sm text-foreground">
          {formatPrice(data.car.price_per_day)} / día · Total{' '}
          {formatPrice(total)}
        </Text>
        {data.payment ? (
          <PaymentSummary payment={data.payment} />
        ) : (
          <Text className="text-muted-foreground">Sin pago registrado</Text>
        )}
        {paidMessage && (
          <Text className="text-sm text-foreground">{paidMessage}</Text>
        )}
        <PayReservationBlock
          reservation={data}
          onPaid={() => {
            setPaidMessage('Pago registrado, queda pendiente de confirmación')
            refetch()
          }}
        />
        <CancelReservationBlock reservation={data} />
      </AppCard>
    </ScrollView>
    </Animated.View>
  )
}
