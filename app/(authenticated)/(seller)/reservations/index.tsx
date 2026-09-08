import { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native'
import {
  useConfirmReservation,
  useSellerReservations,
} from '@/hooks/useReservations'
import type { Reservation } from '@/types/reservation'
import { STATUS_LABELS, STATUS_TONES } from '@/constants/reservation-ui'
import { formatPrice } from '@/utils/currency'
import { daysBetween, formatDate } from '@/utils/dates'
import { getApiErrorMessage } from '@/utils/errors'
import { AppButton, AppCard, EmptyState, FormError } from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'

export default function ReservedScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useSellerReservations()
  const confirm = useConfirmReservation()

  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [confirmErrorId, setConfirmErrorId] = useState<number | null>(null)

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar las reservas')
    : null

  const confirmError =
    confirm.isError && confirmErrorId !== null
      ? getApiErrorMessage(confirm.error, 'Error al confirmar la reserva')
      : null

  const canConfirm = (r: Reservation) =>
    r.status === 'pending' && r.payment?.status === 'pending'


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

  const renderItem = ({ item }: { item: Reservation }) => {
    const confirming = confirmingId === item.id
    return (
      <AppCard>
        <View className="flex-row items-center justify-between gap-2">
          <Text className="flex-1 text-base font-bold text-foreground">
            {item.car.name}
          </Text>
          <StatusBadge tone={STATUS_TONES[item.status]}>
            {STATUS_LABELS[item.status]}
          </StatusBadge>
        </View>
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
        {item.payment?.proof_url ? (
          <Text className="text-muted-foreground" numberOfLines={1}>
            Comprobante: {item.payment.proof_url}
          </Text>
        ) : null}
        {item.status === 'pending' && !item.payment && (
          <Text className="text-muted-foreground">
            Esperando pago del comprador
          </Text>
        )}
        {canConfirm(item) && (
          <AppButton
            onPress={() => setConfirmingId(confirming ? null : item.id)}
            disabled={confirm.isPending}
          >
            Confirmar
          </AppButton>
        )}
        {confirming && canConfirm(item) && (
          <View className="mt-1 gap-2">
            {confirm.isPending ? (
              <ActivityIndicator />
            ) : (
              <>
                <Text className="text-muted-foreground">
                  ¿Confirmar la reserva de {item.car.name}?
                </Text>
                {confirmError && confirmErrorId === item.id && (
                  <FormError message={confirmError} />
                )}
                <View className="flex-row items-center gap-2">
                  <AppButton
                    onPress={() =>
                      confirm.mutate(item.id, {
                        onSuccess: () => {
                          setConfirmErrorId(null)
                          setConfirmingId(null)
                          Alert.alert('Reserva confirmada', `Reserva #${item.id} confirmada`)
                        },
                        onError: () => setConfirmErrorId(item.id),
                      })
                    }
                    disabled={confirm.isPending}
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
      ListEmptyComponent={<EmptyState message="No hay reservas" />}
    />
  )
}

