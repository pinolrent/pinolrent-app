import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Alert } from 'react-native'
import { Button, ButtonText } from '../../../../components/ui/button'
import { useCar } from '@/hooks/useCars'
import { useCreateReservation } from '@/hooks/useReservations'
import { formatPrice } from '@/utils/currency'
import { daysBetween, isValidISODate, toISO } from '@/utils/dates'
import { getApiErrorMessage } from '@/utils/errors'

export default function ReserveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: car, isLoading: carLoading, isError: carError, error: carErr, refetch: refetchCar } =
    useCar(Number(id))
  const createReservation = useCreateReservation()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [clientError, setClientError] = useState<string | null>(null)

  if (carLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!car) {
    return (
      <View style={styles.center}>
        <Text style={styles.subtitle}>
          {carError ? getApiErrorMessage(carErr, 'Error al cargar el auto') : 'No se encontró el auto'}
        </Text>
        <Button variant="default" onPress={() => refetchCar()}>
          <ButtonText>Reintentar</ButtonText>
        </Button>
      </View>
    )
  }

  const today = toISO(new Date())

  const validRange =
    isValidISODate(startDate) &&
    isValidISODate(endDate) &&
    startDate >= today &&
    endDate >= startDate &&
    daysBetween(startDate, endDate) <= 30
  const previewDays = validRange ? daysBetween(startDate, endDate) + 1 : 0
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
    if (endDate < startDate) {
      setClientError('La fecha de fin debe ser posterior o igual a la de inicio')
      return
    }
    if (daysBetween(startDate, endDate) > 30) {
      setClientError('La reserva no puede superar los 30 días')
      return
    }
    createReservation.mutate(
      { car_id: car.id, start_date: startDate, end_date: endDate },
      {
        onSuccess: (res) => {
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Reservar {car.name}</Text>
      <Text style={styles.subtitle}>
        {formatPrice(car.price_per_day)} / día
      </Text>
      {validRange && (
        <Text style={styles.subtitle}>
          {previewDays} {previewDays === 1 ? 'día' : 'días'} · Total estimado{' '}
          {formatPrice(previewTotal)}
        </Text>
      )}

      <TextInput accessibilityLabel="Fecha inicio (YYYY-MM-DD)"
        style={styles.input}
        placeholder="Fecha inicio (YYYY-MM-DD)"
        placeholderTextColor="#888"
        autoCapitalize="none"
        autoCorrect={false}
        value={startDate}
        onChangeText={setStartDate}
      />

      <TextInput accessibilityLabel="Fecha fin (YYYY-MM-DD)"
        style={styles.input}
        placeholder="Fecha fin (YYYY-MM-DD)"
        placeholderTextColor="#888"
        autoCapitalize="none"
        autoCorrect={false}
        value={endDate}
        onChangeText={setEndDate}
      />

      {(clientError || serverError) && (
        <Text style={styles.error}>{clientError ?? serverError}</Text>
      )}

      <Button onPress={onSubmit} disabled={createReservation.isPending}>
        {createReservation.isPending ? (
          <ActivityIndicator />
        ) : (
          <ButtonText>Reservar</ButtonText>
        )}
      </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  subtitle: { color: '#aaa' },
  input: {
    backgroundColor: '#fff',
    color: '#000',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  error: { color: '#ff6467' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
})