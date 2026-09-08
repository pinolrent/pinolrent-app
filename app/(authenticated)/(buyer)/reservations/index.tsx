import { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useMyReservations, useCancelReservation } from '@/hooks/useReservations'
import * as Haptics from 'expo-haptics'
import { useCreatePayment } from '@/hooks/usePayments'
import type { Reservation } from '@/types/reservation'
import { STATUS_LABELS, STATUS_TONES } from '@/constants/reservation-ui'
import type { Payment } from '@/types/payment'
import { formatPrice } from '@/utils/currency'
import { daysBetween, formatDate } from '@/utils/dates'
import { getApiErrorMessage } from '@/utils/errors'
import { AppButton, AppCard, EmptyState, FormError } from '@/components/ui-kit'
import { AppInput, StatusBadge } from '@/components/fields'

const PAYMENT_METHODS: Payment['method'][] = ['pos', 'cash']


export default function ReservationsScreen() {
  const router = useRouter()
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

  const [cancelErrorId, setCancelErrorId] = useState<number | null>(null)
  const [payErrorId, setPayErrorId] = useState<number | null>(null)

  const cancelError =
    cancel.isError && cancelErrorId !== null
      ? getApiErrorMessage(cancel.error, 'Error al cancelar la reserva')
      : null

  const payError =
    pay.isError && payErrorId !== null
      ? getApiErrorMessage(pay.error, 'Error al registrar el pago')
      : null

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background p-6">
        <Text className="text-muted-foreground">{errorMessage}</Text>
        <AppButton onPress={() => refetch()}>Reintentar</AppButton>
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
      {
        onSuccess: () => {
          setPayErrorId(null)
          setPayingId(null)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          Alert.alert('Pago registrado', 'Queda pendiente de confirmación')
        },
        onError: () => setPayErrorId(id),
      }
    )
  }

  const renderItem = ({ item }: { item: Reservation }) => {
    const confirming = confirmingId === item.id
    const paying = payingId === item.id
    return (
      <AppCard>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push(`/(authenticated)/(buyer)/reservations/${item.id}`)
          }
        >
          <View className="flex-row items-center justify-between gap-2">
            <Text className="flex-1 text-base font-bold text-foreground">
              {item.car.name}
            </Text>
            <StatusBadge tone={STATUS_TONES[item.status]}>
              {STATUS_LABELS[item.status]}
            </StatusBadge>
          </View>
        </Pressable>
        <Text className="text-muted-foreground">
          {formatDate(item.start_date)} – {formatDate(item.end_date)}
        </Text>
        <Text className="text-sm text-foreground">
          {formatPrice(item.car.price_per_day)} / día · Total{' '}
          {formatPrice((daysBetween(item.start_date, item.end_date) + 1) * item.car.price_per_day)}
        </Text>
        {item.payment && (
          <Text className="text-muted-foreground">
            Pago: {item.payment.method} · {item.payment.status}
          </Text>
        )}
        {canCancel(item) && (
          <AppButton
            variant="destructive"
            onPress={() => {
              setPayingId(null)
              setConfirmingId(confirming ? null : item.id)
            }}
            disabled={cancel.isPending}
          >
            Cancelar
          </AppButton>
        )}
        {canPay(item) && (
          <AppButton
            onPress={() => openPayForm(item.id)}
            disabled={pay.isPending}
          >
            {paying ? 'Cerrar pago' : 'Pagar'}
          </AppButton>
        )}
        {paying && (
          <View className="mt-1 gap-2">
            <View className="flex-row gap-2">
              {PAYMENT_METHODS.map((m) => (
                <Pressable
                  key={m}
                  accessibilityRole="button"
                  onPress={() => setPayMethod(m)}
                  className={`rounded-lg border px-3 py-1.5 ${
                    payMethod === m
                      ? 'border-primary bg-primary'
                      : 'border-border bg-card'
                  }`}
                >
                  <Text
                    className={
                      payMethod === m
                        ? 'text-primary-foreground'
                        : 'text-foreground'
                    }
                  >
                    {m}
                  </Text>
                </Pressable>
              ))}
            </View>
            <AppInput
              label="Comprobante"
              placeholder="proof_url (opcional, https://...)"
              autoCapitalize="none"
              autoCorrect={false}
              value={payProofUrl}
              onChangeText={setPayProofUrl}
            />
            <FormError
              message={
                payClientError ??
                (payError && payErrorId === item.id ? payError : null)
              }
            />
            <View className="flex-row items-center gap-2">
              <AppButton
                onPress={() => submitPayment(item.id)}
                disabled={pay.isPending}
              >
                {pay.isPending ? <ActivityIndicator /> : 'Registrar pago'}
              </AppButton>
              <AppButton variant="ghost" onPress={() => setPayingId(null)}>
                Volver
              </AppButton>
            </View>
          </View>
        )}
        {confirming && (
          <View className="mt-1 gap-2">
            {cancel.isPending ? (
              <ActivityIndicator />
            ) : (
              <>
                <Text className="text-muted-foreground">
                  ¿Cancelar la reserva de {item.car.name}?
                </Text>
                {cancelError && cancelErrorId === item.id && (
                  <FormError message={cancelError} />
                )}
                <View className="flex-row items-center gap-2">
                  <AppButton
                    variant="destructive"
                    onPress={() =>
                      cancel.mutate(item.id, {
                        onError: () => setCancelErrorId(item.id),
                        onSuccess: () => {
                          setCancelErrorId(null)
                          setConfirmingId(null)
                        },
                      })
                    }
                    disabled={cancel.isPending}
                  >
                    Confirmar
                  </AppButton>
                  <AppButton
                    variant="ghost"
                    onPress={() => setConfirmingId(null)}
                  >
                    Volver
                  </AppButton>
                </View>
              </>
            )}
          </View>
        )}
      </AppCard>
    )
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, gap: 12 }}
      data={data ?? []}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
      }
      ListEmptyComponent={
        <EmptyState
          message="No has hecho ninguna reserva"
          action={
            <AppButton
              onPress={() => router.push('/(authenticated)/(buyer)/catalog')}
            >
              Explorar autos
            </AppButton>
          }
        />
      }
    />
  )
}

