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
import { daysBetween, formatDays, isValidISODate, toISO } from '@/utils/dates'
import { reservationTotal } from '@/utils/reservations'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { AppButton, AppCard, ErrorState, FormError } from '@/components/ui-kit'
import { DateField } from '@/components/DateField'

export default function ReserveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const reduceMotion = useReduceMotion()
  const idNum = Number(id)
  const invalidId = !Number.isFinite(idNum)
  const { data: car, isLoading: carLoading, isError: carError, error: carErr, refetch: refetchCar, isRefetching: carRefetching } =
    useCar(idNum)
  const createReservation = useCreateReservation()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startError, setStartError] = useState<string | null>(null)
  const [endError, setEndError] = useState<string | null>(null)

  const editStart = (v: string) => {
    setStartDate(v)
    setStartError(null)
    createReservation.reset()
  }

  const editEnd = (v: string) => {
    setEndDate(v)
    setEndError(null)
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

  const validRange =
    isValidISODate(startDate) &&
    isValidISODate(endDate) &&
    startDate >= today &&
    endDate > startDate &&
    daysBetween(startDate, endDate) < 30
  const preview = validRange
    ? reservationTotal(startDate, endDate, car.price_per_day)
    : { days: 0, total: 0 }
  const { days: previewDays, total: previewTotal } = preview

  const onSubmit = () => {
    setStartError(null)
    setEndError(null)
    if (!isValidISODate(startDate)) {
      setStartError('Selecciona la fecha de inicio')
      return
    }
    if (!isValidISODate(endDate)) {
      setEndError('Selecciona la fecha de fin')
      return
    }
    if (startDate < today) {
      setStartError('La fecha de inicio no puede ser anterior a hoy')
      return
    }
    if (endDate <= startDate) {
      setEndError('La reserva debe durar al menos 1 día')
      return
    }
    if (daysBetween(startDate, endDate) >= 30) {
      setEndError('La reserva no puede superar los 30 días')
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
            <AppCard className="gap-4">
              <DateField
                label="Fecha inicio"
                value={startDate}
                onChange={editStart}
                error={startError}
                minimumDate={new Date()}
              />
              <DateField
                label="Fecha fin"
                value={endDate}
                onChange={editEnd}
                error={endError}
                minimumDate={new Date(Date.now() + 86400000)}
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
