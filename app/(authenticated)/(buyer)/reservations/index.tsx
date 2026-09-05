import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native'
import { Button, ButtonText } from '../../../../components/ui/button'
import { useMyReservations, useCancelReservation } from '@/hooks/useReservations'
import type { Reservation } from '@/types/reservation'
import { formatPrice } from '@/utils/currency'
import { formatDate } from '@/utils/dates'

const STATUS_LABELS: Record<Reservation['status'], string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

const STATUS_COLORS: Record<Reservation['status'], string> = {
  pending: '#b45309',
  confirmed: '#15803d',
  cancelled: '#6b7280',
}

export default function ReservationsScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useMyReservations()
  const cancel = useCancelReservation()

  const errorMessage = isError
    ? (error as any)?.response?.data?.error ||
      error?.message ||
      'Error al cargar las reservas'
    : null

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.subtitle}>{errorMessage}</Text>
        <Button variant="default" onPress={() => refetch()}>
          <ButtonText>Reintentar</ButtonText>
        </Button>
      </View>
    )
  }

  const canCancel = (r: Reservation) => r.status === 'pending' && !r.payment

  const onCancel = (r: Reservation) => {
    Alert.alert('Cancelar reserva', `¿Cancelar la reserva de ${r.car.name}?`, [
      { text: 'No', style: 'cancel' },
      { text: 'Sí', style: 'destructive', onPress: () => cancel.mutate(r.id) },
    ])
  }

  const renderItem = ({ item }: { item: Reservation }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.car.name}</Text>
        <Text style={{ color: STATUS_COLORS[item.status] }}>
          {STATUS_LABELS[item.status]}
        </Text>
      </View>
      <Text style={styles.subtitle}>
        {formatDate(item.start_date)} – {formatDate(item.end_date)}
      </Text>
      <Text style={styles.cardPrice}>{formatPrice(item.car.price_per_day)}</Text>
      {item.payment && (
        <Text style={styles.subtitle}>
          Pago: {item.payment.method} · {item.payment.status}
        </Text>
      )}
      {canCancel(item) && (
        <Button
          variant="destructive"
          onPress={() => onCancel(item)}
          disabled={cancel.isPending}
        >
          <ButtonText>Cancelar</ButtonText>
        </Button>
      )}
    </View>
  )

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={data ?? []}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.subtitle}>No tenés reservas</Text>
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#000', flex: 1 },
  cardPrice: { fontSize: 14, color: '#444' },
  subtitle: { color: '#aaa' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
})