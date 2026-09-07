import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Button, ButtonText } from '../../../../components/ui/button'
import { useReservation } from '@/hooks/useReservations'
import { STATUS_COLORS, STATUS_LABELS } from '@/constants/reservation-ui'
import { formatPrice } from '@/utils/currency'
import { daysBetween, formatDate } from '@/utils/dates'
import { getApiErrorMessage } from '@/utils/errors'

export default function ReservationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data, isLoading, isError, error, refetch } = useReservation(Number(id))

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar la reserva')
    : null

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.subtitle}>
          {errorMessage ?? 'No se encontró la reserva'}
        </Text>
        <Button variant="default" onPress={() => refetch()}>
          <ButtonText>Reintentar</ButtonText>
        </Button>
      </View>
    )
  }

  const days = daysBetween(data.start_date, data.end_date) + 1
  const total = days * data.car.price_per_day

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{data.car.name}</Text>
        <Text style={{ color: STATUS_COLORS[data.status] }}>
          {STATUS_LABELS[data.status]}
        </Text>
      </View>
      <Text style={styles.subtitle}>
        {formatDate(data.start_date)} – {formatDate(data.end_date)} ({days}{' '}
        {days === 1 ? 'día' : 'días'})
      </Text>
      <Text style={styles.cardPrice}>
        {formatPrice(data.car.price_per_day)} / día · Total {formatPrice(total)}
      </Text>
      {data.payment ? (
        <Text style={styles.subtitle}>
          Pago: {data.payment.method} · {data.payment.status}
          {data.payment.proof_url ? ` · ${data.payment.proof_url}` : ''}
        </Text>
      ) : (
        <Text style={styles.subtitle}>Sin pago registrado</Text>
      )}
      {data.status === 'pending' && !data.payment && (
        <Text style={styles.subtitle}>
          Podés cancelarla desde la lista mientras no tenga pago.
        </Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  subtitle: { color: '#aaa' },
  cardPrice: { fontSize: 14, color: '#444' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
})
