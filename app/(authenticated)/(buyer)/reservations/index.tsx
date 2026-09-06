import { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  TextInput,
} from 'react-native'
import { Button, ButtonText } from '../../../../components/ui/button'
import { useMyReservations, useCancelReservation } from '@/hooks/useReservations'
import { useCreatePayment } from '@/hooks/usePayments'
import type { Reservation } from '@/types/reservation'
import type { Payment } from '@/types/payment'
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

const PAYMENT_METHODS: Payment['method'][] = ['pos', 'cash']

export default function ReservationsScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useMyReservations()
  const cancel = useCancelReservation()
  const pay = useCreatePayment()

  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [payingId, setPayingId] = useState<number | null>(null)
  const [payMethod, setPayMethod] = useState<Payment['method']>('pos')
  const [payProofUrl, setPayProofUrl] = useState('')
  const [payClientError, setPayClientError] = useState<string | null>(null)

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar las reservas')
    : null

  const cancelError = cancel.isError
    ? getApiErrorMessage(cancel.error, 'Error al cancelar la reserva')
    : null

  const payError = pay.isError
    ? getApiErrorMessage(pay.error, 'Error al registrar el pago')
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
  const canPay = (r: Reservation) => r.status === 'pending' && !r.payment

  const openPayForm = (id: number) => {
    setConfirmingId(null)
    setPayClientError(null)
    pay.reset()
    setPayMethod('pos')
    setPayProofUrl('')
    setPayingId(payingId === id ? null : id)
  }

  const submitPayment = (id: number) => {
    const proof = payProofUrl.trim()
    if (proof.length > 0) {
      if (proof.length > 2048) {
        setPayClientError('proof_url es demasiado largo')
        return
      }
      if (!/^https?:\/\/.+/i.test(proof)) {
        setPayClientError('proof_url inválido')
        return
      }
    }
    setPayClientError(null)
    pay.mutate(
      {
        reservationId: id,
        data: proof
          ? { method: payMethod, proof_url: proof }
          : { method: payMethod },
      },
      { onSuccess: () => setPayingId(null) }
    )
  }

  const renderItem = ({ item }: { item: Reservation }) => {
    const confirming = confirmingId === item.id
    const paying = payingId === item.id
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
        <Text style={styles.cardPrice}>{formatPrice(item.car.price_per_day)}</Text>
        {item.payment && (
          <Text style={styles.subtitle}>
            Pago: {item.payment.method} · {item.payment.status}
          </Text>
        )}
        {canCancel(item) && (
          <Button
            variant="destructive"
            onPress={() => {
              setPayingId(null)
              setConfirmingId(confirming ? null : item.id)
            }}
            disabled={cancel.isPending}
          >
            <ButtonText>Cancelar</ButtonText>
          </Button>
        )}
        {canPay(item) && (
          <Button
            variant="default"
            onPress={() => openPayForm(item.id)}
            disabled={pay.isPending}
          >
            <ButtonText>{paying ? 'Cerrar pago' : 'Pagar'}</ButtonText>
          </Button>
        )}
        {paying && (
          <View style={styles.confirmBox}>
            <View style={styles.methodRow}>
              {PAYMENT_METHODS.map((m) => (
                <Pressable
                  key={m}
                  style={[
                    styles.methodChip,
                    payMethod === m && styles.methodChipActive,
                  ]}
                  onPress={() => setPayMethod(m)}
                >
                  <Text
                    style={[
                      styles.methodChipText,
                      payMethod === m && styles.methodChipTextActive,
                    ]}
                  >
                    {m}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="proof_url (opcional, https://...)"
              placeholderTextColor="#888"
              autoCapitalize="none"
              autoCorrect={false}
              value={payProofUrl}
              onChangeText={setPayProofUrl}
            />
            {(payClientError || payError) && (
              <Text style={styles.error}>{payClientError ?? payError}</Text>
            )}
            <View style={styles.confirmActions}>
              <Button
                variant="default"
                onPress={() => submitPayment(item.id)}
                disabled={pay.isPending}
              >
                {pay.isPending ? (
                  <ActivityIndicator />
                ) : (
                  <ButtonText>Registrar pago</ButtonText>
                )}
              </Button>
              <Button variant="ghost" onPress={() => setPayingId(null)}>
                <ButtonText>Volver</ButtonText>
              </Button>
            </View>
          </View>
        )}
        {confirming && (
          <View style={styles.confirmBox}>
            {cancel.isPending ? (
              <ActivityIndicator />
            ) : (
              <>
                <Text style={styles.subtitle}>
                  ¿Cancelar la reserva de {item.car.name}?
                </Text>
                {cancelError && <Text style={styles.error}>{cancelError}</Text>}
                <View style={styles.confirmActions}>
                  <Button
                    variant="destructive"
                    onPress={() => cancel.mutate(item.id)}
                    disabled={cancel.isPending}
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
  confirmBox: { gap: 8, marginTop: 4 },
  confirmActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  methodRow: { flexDirection: 'row', gap: 8 },
  methodChip: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  methodChipActive: { backgroundColor: '#000', borderColor: '#000' },
  methodChipText: { color: '#444' },
  methodChipTextActive: { color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#000',
  },
  error: { color: '#ff6467' },
  subtitle: { color: '#aaa' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
})