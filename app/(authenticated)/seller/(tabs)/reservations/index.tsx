import { FlatList, RefreshControl, Text, View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useSellerReservations } from '@/hooks/useReservations'
import { useTransientNotice } from '@/hooks/useTransientNotice'
import type { Reservation } from '@/types/reservation'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { ProofLink } from '@/components/ProofLink'
import { ReservationColumns, ReservationRow } from '@/components/rows'
import {
  ConfirmReservationBlock,
  RejectReservationBlock,
  canConfirmReservation,
} from '@/components/ReservationActions'
import {
  AppPressable,
  EmptyState,
  ErrorState,
  SuccessNote,
} from '@/components/ui-kit'
import { SkeletonList } from '@/components/Skeleton'
import { StaggerCard } from '@/components/StaggerCard'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useThemeColors } from '@/hooks/useThemeColors'

export default function SellerReservationsScreen() {
  const router = useRouter()
  const colors = useThemeColors()
  const { isDesktop } = useBreakpoints()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useSellerReservations()
  const [notice, setNotice] = useTransientNotice()

  const reservations = data ?? []
  const pending = reservations.filter(
    (r) => r.status === 'pending' && r.payment?.status === 'pending'
  ).length
  const pendingLabel = `${pending} ${pending === 1 ? 'pendiente' : 'pendientes'}`

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar tus reservas')
    : null

  const onConfirmed = (reservation: Reservation) => {
    setNotice(`Reserva #${reservation.id} confirmada`)
  }

  const onRejected = (reservation: Reservation) => {
    setNotice(`Reserva #${reservation.id} rechazada`)
  }

  const detailHref = (id: number) =>
    `/(authenticated)/seller/reservations/${id}`

  const proofLink = (item: Reservation) => (
    <ProofLink url={item.payment?.proof_url} />
  )

  const renderItem = ({
    item,
    index,
  }: {
    item: Reservation
    index: number
  }) => {
    const confirmable = canConfirmReservation(item)

    if (isDesktop) {
      return (
        <StaggerCard index={index}>
          <View className="border-b border-border">
            <ReservationRow
              reservation={item}
              columns
              action={
                <View className="items-end gap-2">
                  <Link href={detailHref(item.id)} asChild>
                    <AppPressable
                      accessibilityRole="link"
                      accessibilityLabel="Ver detalle de la reserva"
                      className="min-h-11 justify-center"
                    >
                      <Text className="text-sm text-primary">Ver detalle</Text>
                    </AppPressable>
                  </Link>
                  {proofLink(item)}
                </View>
              }
            />
            {confirmable && (
              <View className="flex-row items-center gap-2 border-t border-border bg-muted/40 px-4 py-3">
                <ConfirmReservationBlock
                  reservation={item}
                  onConfirmed={onConfirmed}
                />
                <RejectReservationBlock
                  reservation={item}
                  onRejected={onRejected}
                />
              </View>
            )}
          </View>
        </StaggerCard>
      )
    }

    return (
      <StaggerCard index={index}>
        <ReservationRow
          reservation={item}
          onPress={() => router.push(detailHref(item.id))}
          action={
            confirmable ? (
              <View className="gap-2">
                <ConfirmReservationBlock
                  reservation={item}
                  onConfirmed={onConfirmed}
                />
                <RejectReservationBlock
                  reservation={item}
                  onRejected={onRejected}
                />
              </View>
            ) : undefined
          }
        />
      </StaggerCard>
    )
  }

  return (
    <ScreenShell
      title="Reservas"
      subtitle={
        isLoading
          ? undefined
          : `${reservations.length} en total · ${pendingLabel}`
      }
    >
      {isLoading ? (
        <SkeletonList count={4} variant="cardRow" />
      ) : isError ? (
        <ErrorState
          message={errorMessage}
          onRetry={() => refetch()}
          retrying={isRefetching}
          centered
        />
      ) : (
        <View className="flex-1 gap-3">
          <SuccessNote message={notice} />
          <FlatList
            className="flex-1"
            contentContainerStyle={
              isDesktop
                ? { flexGrow: 1, paddingBottom: 16 }
                : { flexGrow: 1, gap: 12, paddingBottom: 16 }
            }
            data={reservations}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            ListHeaderComponent={
              isDesktop && reservations.length > 0 ? (
                <ReservationColumns />
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => refetch()}
                tintColor={colors.primary}
                colors={[colors.primary]}
                progressBackgroundColor={colors.card}
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
