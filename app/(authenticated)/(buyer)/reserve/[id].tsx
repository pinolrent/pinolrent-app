import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SkeletonList } from '@/components/Skeleton'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCar } from '@/hooks/useCars'
import * as Haptics from 'expo-haptics'
import { useCreateReservation } from '@/hooks/useReservations'
import { formatPrice } from '@/utils/currency'
import { daysBetween, formatDays, isValidISODate, toISO } from '@/utils/dates'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { AppButton, AppCard, ErrorState, FormError } from '@/components/ui-kit'
import { DateField } from '@/components/DateField'

export default function ReserveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const idNum = Number(id)
  const invalidId = !Number.isFinite(idNum)
  const { data: car, isLoading: carLoading, isError: carError, error: carErr, refetch: refetchCar, isRefetching: carRefetching } =
    useCar(idNum)
  const createReservation = useCreateReservation()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [clientError, setClientError] = useState<string | null>(null)

  const editStart = (v: string) => {
    setStartDate(v)
    createReservation.reset()
  }

  const editEnd = (v: string) => {
    setEndDate(v)
    createReservation.reset()
  }

  if (carLoading) {
    return (
      <ScreenShell width="form">
        <SkeletonList count={2} />
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
  const previewDays = validRange ? daysBetween(startDate, endDate) : 0
  const previewTotal = previewDays * car.price_per_day

  const onSubmit = () => {
    setClientError(null)
    if (!isValidISODate(startDate) || !isValidISODate(endDate)) {
      setClientError('Selecciona fechas válidas en el calendario')
      return
    }
    if (startDate < today) {
      setClientError('La fecha de inicio no puede ser anterior a hoy')
      return
    }
    if (endDate <= startDate) {
      setClientError('La reserva debe durar al menos 1 día')
      return
    }
    if (daysBetween(startDate, endDate) >= 30) {
      setClientError('La reserva no puede superar los 30 días')
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
            {car.name} · {formatPrice(car.price_per_day)} / día
          </Text>
          <AppCard className="gap-4">
            <DateField
              label="Fecha inicio"
              value={startDate}
              onChange={editStart}
              minimumDate={new Date()}
            />
            <DateField
              label="Fecha fin"
              value={endDate}
              onChange={editEnd}
              minimumDate={new Date(Date.now() + 86400000)}
            />
            <FormError message={clientError ?? serverError} />
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
            <AppButton onPress={onSubmit} loading={createReservation.isPending}>
              Reservar
            </AppButton>
          </AppCard>
        </ScrollView>
      </ScreenShell>
    </KeyboardAvoidingView>
  )
}
