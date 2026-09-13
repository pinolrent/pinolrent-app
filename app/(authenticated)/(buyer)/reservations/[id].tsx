import { useState } from 'react'
import { View, Text, ScrollView, RefreshControl } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useLocalSearchParams } from 'expo-router'
import { useReservation } from '@/hooks/useReservations'
import { STATUS_LABELS, STATUS_TONES } from '@/constants/reservation-ui'
import { formatPrice } from '@/utils/currency'
import { daysBetween, formatDateRange, formatDays } from '@/utils/dates'
import { getApiErrorMessage } from '@/utils/errors'
import { useReduceMotion } from '@/components/PressScale'
import { ScreenShell } from '@/components/ScreenShell'
import { CarRow } from '@/components/rows'
import { AppButton, AppCard, FormError, SuccessNote } from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { SkeletonList } from '@/components/Skeleton'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import {
  CancelReservationBlock,
  PayReservationBlock,
  PaymentSummary,
} from '@/components/ReservationActions'

export default function ReservationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const idNum = Number(id)
  const invalidId = !Number.isFinite(idNum)
  const reduceMotion = useReduceMotion()
  const { isPhone } = useBreakpoints()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useReservation(idNum)
  const [paidMessage, setPaidMessage] = useState<string | null>(null)

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar la reserva')
    : null

  if (isLoading) {
    return (
      <ScreenShell back title="Reserva">
        <SkeletonList count={2} />
      </ScreenShell>
    )
  }

  if (invalidId || isError || !data) {
    return (
      <ScreenShell back title="Reserva">
        <View className="items-center gap-3 py-8">
          <FormError
            message={
              invalidId
                ? 'No encontramos esa reserva'
                : (errorMessage ?? 'No encontramos esa reserva')
            }
          />
          {!invalidId && (
            <AppButton onPress={() => refetch()}>Reintentar</AppButton>
          )}
        </View>
      </ScreenShell>
    )
  }

  const days = daysBetween(data.start_date, data.end_date)
  const total = days * data.car.price_per_day

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeIn.duration(200)}
      className="flex-1"
    >
      <ScreenShell
        back
        title={data.car.name}
        subtitle={`${formatDateRange(data.start_date, data.end_date)} · ${formatDays(days)}`}
        action={
          <StatusBadge tone={STATUS_TONES[data.status]}>
            {STATUS_LABELS[data.status]}
          </StatusBadge>
        }
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
            />
          }
        >
          <View className={isPhone ? 'gap-4' : 'flex-row items-start gap-6'}>
            <View className="flex-1">
              <AppCard className="gap-4">
                <CarRow car={data.car} />
                <View className={isPhone ? 'gap-4' : 'flex-row gap-6'}>
                  <View className="flex-1 gap-1">
                    <Text className="text-sm text-muted-foreground">Fechas</Text>
                    <Text className="text-base text-foreground">
                      {formatDateRange(data.start_date, data.end_date)}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {formatDays(days)}
                    </Text>
                  </View>
                  <View className="flex-1 gap-1">
                    <Text className="text-sm text-muted-foreground">Pago</Text>
                    {data.payment ? (
                      <PaymentSummary payment={data.payment} />
                    ) : (
                      <Text className="text-base text-foreground">
                        Sin pago registrado
                      </Text>
                    )}
                  </View>
                </View>
              </AppCard>
            </View>
            <View className={isPhone ? 'gap-3' : 'w-80 gap-3'}>
              <AppCard className="gap-1">
                <Text className="text-sm text-muted-foreground">
                  {formatPrice(data.car.price_per_day)} / día ×{' '}
                  {formatDays(days)}
                </Text>
                <Text className="text-2xl font-bold text-foreground">
                  {formatPrice(total)}
                </Text>
              </AppCard>
              {paidMessage && (
                <SuccessNote message={paidMessage} />
              )}
              <PayReservationBlock
                reservation={data}
                onPaid={() => {
                  setPaidMessage(
                    'Pago registrado, queda pendiente de confirmación'
                  )
                  refetch()
                }}
              />
              <CancelReservationBlock reservation={data} />
            </View>
          </View>
        </ScrollView>
      </ScreenShell>
    </Animated.View>
  )
}
