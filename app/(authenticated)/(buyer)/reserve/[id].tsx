import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SkeletonList } from '@/components/Skeleton'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCar } from '@/hooks/useCars'
import { useReduceMotion } from '@/hooks/useReduceMotion'
import * as Haptics from 'expo-haptics'
import { useCreateReservation } from '@/hooks/useReservations'
import { formatPrice, formatPricePerDay } from '@/utils/currency'
import { formatDays, isValidISODate, toISO } from '@/utils/dates'
import {
  MAX_RESERVATION_NIGHTS,
  isValidReservationRange,
  reservationRangeError,
  reservationTotal,
} from '@/utils/reservations'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { AppButton, AppCard, ErrorState, FormError } from '@/components/ui-kit'
import { DateRangeField } from '@/components/DateField'

export default function ReserveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const reduceMotion = useReduceMotion()
  const idNum = Number(id)
  const invalidId = !Number.isFinite(idNum)
  const {
    data: car,
    isLoading: carLoading,
    isError: carError,
    error: carErr,
    refetch: refetchCar,
    isRefetching: carRefetching,
  } = useCar(idNum)
  const createReservation = useCreateReservation()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [rangeError, setRangeError] = useState<string | null>(null)

  const editRange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
    setRangeError(null)
    createReservation.reset()
  }

  if (carLoading) {
    return (
      <ScreenShell width="form">
        <SkeletonList count={1} />
      </ScreenShell>
    )
  }

  if (invalidId || !car) {
    return (
      <ScreenShell width="form">
        <ErrorState
          message={
            carError
              ? getApiErrorMessage(carErr, 'Error al cargar el auto')
              : 'No encontramos ese auto'
          }
          onRetry={invalidId ? undefined : () => refetchCar()}
          retrying={carRefetching}
        />
      </ScreenShell>
    )
  }

  const today = toISO(new Date())
  const hasStart = isValidISODate(startDate)
  const hasEnd = isValidISODate(endDate)

  const rangeHint = reservationRangeError(startDate, endDate, today)
  const validRange = isValidReservationRange(startDate, endDate, today)
  const preview = validRange
    ? reservationTotal(startDate, endDate, car.price_per_day)
    : { days: 0, total: 0 }
  const { days: previewDays, total: previewTotal } = preview

  const onSubmit = () => {
    setRangeError(null)
    if (!hasStart || !hasEnd) {
      setRangeError('Selecciona las fechas de inicio y fin')
      return
    }
    const rangeValidation = reservationRangeError(startDate, endDate, today)
    if (rangeValidation) {
      setRangeError(rangeValidation)
      return
    }
    createReservation.mutate(
      { car_id: car.id, start_date: startDate, end_date: endDate },
      {
        onSuccess: (res) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          router.replace(
            `/(authenticated)/(buyer)/reservations?created=${res.id}`
          )
        },
        onError: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        },
      }
    )
  }

  const serverError = createReservation.isError
    ? getApiErrorMessage(createReservation.error, 'Error al crear la reserva')
    : null

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeIn.duration(200)}
      className="flex-1"
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenShell width="form">
          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            <Text className="text-base font-semibold text-foreground">
              {car.name} · {formatPricePerDay(car.price_per_day)}
            </Text>
            <AppCard gap="lg">
              <DateRangeField
                label="Fechas de la reserva"
                startDate={startDate}
                endDate={endDate}
                onChange={editRange}
                error={rangeError ?? rangeHint}
                minimumDate={new Date()}
                maxNights={MAX_RESERVATION_NIGHTS}
              />
              <FormError message={serverError} />
              {validRange && (
                <View className="flex-row items-center justify-between gap-3 border-t border-border pt-3">
                  <Text className="text-sm text-muted-foreground">
                    {formatDays(previewDays)}
                  </Text>
                  <Text className="text-lg font-bold text-foreground">
                    {formatPrice(previewTotal)}
                  </Text>
                </View>
              )}
              <AppButton
                onPress={onSubmit}
                loading={createReservation.isPending}
              >
                Reservar
              </AppButton>
            </AppCard>
          </ScrollView>
        </ScreenShell>
      </KeyboardAvoidingView>
    </Animated.View>
  )
}
