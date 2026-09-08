import { useState } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCar } from '@/hooks/useCars'
import * as Haptics from 'expo-haptics'
import { useCreateReservation } from '@/hooks/useReservations'
import { formatPrice } from '@/utils/currency'
import { daysBetween, isValidISODate, toISO } from '@/utils/dates'
import { getApiErrorMessage } from '@/utils/errors'
import { AppBackButton } from '@/components/nav-icons'
import { AppButton, AppCard, FormError } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'

export default function ReserveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const idNum = Number(id)
  const invalidId = !Number.isFinite(idNum)
  const { data: car, isLoading: carLoading, isError: carError, error: carErr, refetch: refetchCar } =
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
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (invalidId || !car) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background p-6">
        <Text className="text-muted-foreground">
          {invalidId ? 'ID de auto inválido' : (carError ? getApiErrorMessage(carErr, 'Error al cargar el auto') : 'No se encontró el auto')}
        </Text>
        {!invalidId && (
          <AppButton onPress={() => refetchCar()}>Reintentar</AppButton>
        )}
      </View>
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
      setClientError('Formato inválido, esperado YYYY-MM-DD')
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
          Alert.alert('Reserva creada', `Reserva #${res.id} en estado pendiente`)
          router.replace('/(authenticated)/(buyer)/reservations')
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
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 24, gap: 12 }}
      >
        <AppBackButton />
        <Text className="text-2xl font-bold text-foreground">
          Reservar {car.name}
        </Text>
        <Text className="text-muted-foreground">
          {formatPrice(car.price_per_day)} / día
        </Text>
        {validRange && (
          <AppCard>
            <Text className="text-muted-foreground">
              {previewDays} {previewDays === 1 ? 'día' : 'días'} · Total
              estimado {formatPrice(previewTotal)}
            </Text>
          </AppCard>
        )}

        <AppInput
          label="Fecha inicio"
          placeholder="YYYY-MM-DD"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={10}
          value={startDate}
          onChangeText={editStart}
        />

        <AppInput
          label="Fecha fin"
          placeholder="YYYY-MM-DD"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={10}
          value={endDate}
          onChangeText={editEnd}
        />

        <FormError message={clientError ?? serverError} />

        <AppButton onPress={onSubmit} disabled={createReservation.isPending}>
          {createReservation.isPending ? <ActivityIndicator /> : 'Reservar'}
        </AppButton>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

