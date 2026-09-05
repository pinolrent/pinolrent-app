import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Button, ButtonText } from '../../../../components/ui/button'
import { useCar } from '@/hooks/useCars'
import { useCreateReservation } from '@/hooks/useReservations'
import { formatPrice } from '@/utils/currency'
import { toISO } from '@/utils/dates'

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

function isValidISO(value: string) {
  if (!ISO_RE.test(value)) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return date.toISOString().slice(0, 10) === value
}

function daysBetween(start: string, end: string) {
  const s = new Date(`${start}T00:00:00Z`).getTime()
  const e = new Date(`${end}T00:00:00Z`).getTime()
  return Math.round((e - s) / 86400000)
}

export default function ReserveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: car, isLoading: carLoading } = useCar(Number(id))
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
        <Text style={styles.subtitle}>No se encontró el auto</Text>
      </View>
    )
  }

  const today = toISO(new Date())

  const onSubmit = () => {
    setClientError(null)
    if (!isValidISO(startDate) || !isValidISO(endDate)) {
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
        onSuccess: () =>
          router.replace('/(authenticated)/(buyer)/reservations'),
      }
    )
  }

  const serverError = createReservation.isError
    ? (createReservation.error as any)?.response?.data?.error ||
      createReservation.error?.message ||
      'Error al crear la reserva'
    : null

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reservar {car.name}</Text>
      <Text style={styles.subtitle}>{formatPrice(car.price_per_day)}</Text>

      <TextInput
        style={styles.input}
        placeholder="Fecha inicio (YYYY-MM-DD)"
        placeholderTextColor="#888"
        autoCapitalize="none"
        autoCorrect={false}
        value={startDate}
        onChangeText={setStartDate}
      />

      <TextInput
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  subtitle: { color: '#aaa' },
  input: {
    backgroundColor: '#222',
    color: '#fff',
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