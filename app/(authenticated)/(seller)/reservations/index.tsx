import { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { Button, ButtonText } from '../../../../components/ui/button'
import {
  useConfirmReservation,
  useSellerReservations,
} from '@/hooks/useReservations'
import type { Reservation } from '@/types/reservation'
import { formatPrice } from '@/utils/currency'
import { formatDate } from '@/utils/dates'
import { getApiErrorMessage } from '@/utils/errors'

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

export default function ReservedScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useSellerReservations()
  const confirm = useConfirmReservation()

  const [confirmingId, setConfirmingId] = useState<number | null>(null)

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar las reservas')
    : null

  const confirmError = confirm.isError
    ? getApiErrorMessage(confirm.error, 'Error al confirmar la reserva')
    : null

  const canConfirm = (r: Reservation) =>
    r.status === 'pending' && r.payment?.status === 'pending'

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

  const renderItem = ({ item }: { item: Reservation }) => {
    const confirming = confirmingId === item.id
    return (
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
        <Text style={styles.cardPrice}>
          {formatPrice(item.car.price_per_day)}
        </Text>
        {item.payment && (
          <Text style={styles.subtitle}>
            Pago: {item.payment.method} · {item.payment.status}
          </Text>
        )}
        {item.payment?.proof_url ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            Comprobante: {item.payment.proof_url}
          </Text>
        ) : null}
        {item.status === 'pending' && !item.payment && (
          <Text style={styles.subtitle}>
            Esperando pago del comprador
          </Text>
        )}
        {canConfirm(item) && (
          <Button
            variant="default"
            onPress={() => setConfirmingId(confirming ? null : item.id)}
            disabled={confirm.isPending}
          >
            <ButtonText>Confirmar</ButtonText>
          </Button>
        )}
        {confirming && canConfirm(item) && (
          <View style={styles.confirmBox}>
            {confirm.isPending ? (
              <ActivityIndicator />
            ) : (
              <>
                <Text style={styles.subtitle}>
                  ¿Confirmar la reserva de {item.car.name}?
                </Text>
                {confirmError && (
                  <Text style={styles.error}>{confirmError}</Text>
                )}
                <View style={styles.confirmActions}>
                  <Button
                    variant="default"
                    onPress={() =>
                      confirm.mutate(item.id, {
                        onSuccess: () => setConfirmingId(null),
                      })
                    }
                    disabled={confirm.isPending}
                  >
                    <ButtonText>Confirmar</ButtonText>
                  </Button>
                  <Button variant="ghost" onPress={() => setConfirmingId(null)}>
                    <ButtonText>Volver</ButtonText>
                  </Button>
                </View>
              </>
            )}
          </View>
        )}
      </View>
    )
  }

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
          <Text style={styles.subtitle}>No hay reservas</Text>
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
  confirmBox: { gap: 8, marginTop: 4 },
  confirmActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
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