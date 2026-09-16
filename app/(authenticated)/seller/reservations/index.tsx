import * as Haptics from 'expo-haptics'
import { useState } from 'react'
import {
  Linking,
  Pressable,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native'
import {
  useConfirmReservation,
  useSellerReservations,
} from '@/hooks/useReservations'
import type { Reservation } from '@/types/reservation'
import { getApiErrorMessage, isImageUrl, resolveImageUrl } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { ReservationColumns, ReservationRow } from '@/components/rows'
import { AppButton, EmptyState, ErrorState, FormError, SuccessNote } from '@/components/ui-kit'
import { SkeletonList } from '@/components/Skeleton'
import { useBreakpoints } from '@/hooks/useBreakpoints'

export default function SellerReservationsScreen() {
  const { isDesktop } = useBreakpoints()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useSellerReservations()
  const confirm = useConfirmReservation()

  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [confirmErrorId, setConfirmErrorId] = useState<number | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const reservations = data ?? []
  const pending = reservations.filter(
    (r) => r.status === 'pending' && r.payment?.status === 'pending'
  ).length

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar tus reservas')
    : null

  const confirmError =
    confirm.isError && confirmErrorId !== null
      ? getApiErrorMessage(confirm.error, 'Error al confirmar la reserva')
      : null

  const canConfirm = (r: Reservation) =>
    r.status === 'pending' && r.payment?.status === 'pending'

  const onConfirm = (id: number) =>
    confirm.mutate(id, {
      onSuccess: () => {
        setConfirmErrorId(null)
        setConfirmingId(null)
        setNotice(`Reserva #${id} confirmada`)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      },
      onError: () => {
        setConfirmErrorId(id)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      },
    })

  const proofLink = (item: Reservation) =>
    item.payment?.proof_url && isImageUrl(item.payment.proof_url) ? (
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Ver comprobante del pago"
        onPress={() => {
          const url = resolveImageUrl(item.payment!.proof_url)
          if (url) Linking.openURL(url)
        }}
        className="min-h-11 justify-center"
        style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
      >
        <Text
          className="text-sm text-primary"
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          Ver comprobante
        </Text>
      </Pressable>
    ) : null

  const confirmBlock = (item: Reservation) => (
    <View className="gap-2">
      <Text
        accessibilityLiveRegion="polite"
        className="text-sm text-foreground"
      >
        ¿Confirmar la reserva de {item.car.name}?
      </Text>
      <View className="flex-row items-center gap-2">
        <AppButton onPress={() => onConfirm(item.id)} loading={confirm.isPending}>
          Confirmar reserva
        </AppButton>
        <AppButton variant="ghost" onPress={() => setConfirmingId(null)}>
          Volver
        </AppButton>
      </View>
      {confirmError && confirmErrorId === item.id && (
        <FormError message={confirmError} />
      )}
    </View>
  )

  const renderItem = ({ item }: { item: Reservation }) => {
    const confirming = confirmingId === item.id && canConfirm(item)
    const actionable = canConfirm(item)

    if (isDesktop) {
      return (
        <View className="border-b border-border">
          <ReservationRow
            reservation={item}
            columns
            action={
              actionable && !confirming ? (
                <View className="items-end gap-1">
                  <AppButton
                    size="sm"
                    onPress={() => setConfirmingId(item.id)}
                  >
                    Confirmar reserva
                  </AppButton>
                  {proofLink(item)}
                </View>
              ) : (
                <View className="items-end">{proofLink(item)}</View>
              )
            }
          />
          {confirming && (
            <View className="border-t border-border bg-muted/40 px-4 py-3">
              {confirmBlock(item)}
            </View>
          )}
        </View>
      )
    }

    return (
      <ReservationRow
        reservation={item}
        action={
          confirming ? (
            confirmBlock(item)
          ) : actionable ? (
            <View className="gap-1">
              <AppButton onPress={() => setConfirmingId(item.id)}>
                Confirmar reserva
              </AppButton>
              {proofLink(item)}
            </View>
          ) : (
            proofLink(item)
          )
        }
      />
    )
  }

  return (
    <ScreenShell
      title="Reservas"
      subtitle={
        isLoading
          ? undefined
          : `${reservations.length} en total · ${pending} pendientes`
      }
    >
      {isLoading ? (
        <SkeletonList count={4} variant="row" />
      ) : isError ? (
        <ErrorState
          message={errorMessage}
          onRetry={() => refetch()}
          retrying={isRefetching}
        />
      ) : (
        <View className="flex-1 gap-3">
          <SuccessNote message={notice} />
          <FlatList
            className="flex-1"
            contentContainerStyle={
              isDesktop
                ? { paddingBottom: 16 }
                : { gap: 12, paddingBottom: 16 }
            }
            data={reservations}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            ListHeaderComponent={isDesktop ? <ReservationColumns /> : null}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => refetch()}
              />
            }
            ListEmptyComponent={
              <EmptyState message="Todavía no recibiste ninguna reserva" />
            }
          />
        </View>
      )}
    </ScreenShell>
  )
}
