import { useEffect, useState } from 'react'
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useSellerReservations } from '@/hooks/useReservations'
import type { Reservation } from '@/types/reservation'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { ProofLink } from '@/components/ProofLink'
import { ReservationColumns, ReservationRow } from '@/components/rows'
import {
  ConfirmReservationBlock,
  canConfirmReservation,
} from '@/components/ReservationActions'
import { EmptyState, ErrorState, SuccessNote } from '@/components/ui-kit'
import { SkeletonList } from '@/components/Skeleton'
import { StaggerCard } from '@/components/StaggerCard'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useThemeColors } from '@/hooks/useThemeColors'

const NOTICE_MS = 6000

export default function SellerReservationsScreen() {
  const router = useRouter()
  const colors = useThemeColors()
  const { isDesktop } = useBreakpoints()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useSellerReservations()
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), NOTICE_MS)
    return () => clearTimeout(timer)
  }, [notice])

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

  const detailHref = (id: number) =>
    `/(authenticated)/seller/reservations/${id}`

  const detailLink = (id: number) => (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel="Ver detalle de la reserva"
      onPress={() => router.push(detailHref(id))}
      className="min-h-11 justify-center"
      style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
    >
      <Text className="text-sm text-primary">Ver detalle</Text>
    </Pressable>
  )

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
                    <Pressable
                      accessibilityRole="link"
                      accessibilityLabel="Ver detalle de la reserva"
                      className="min-h-11 justify-center"
                      style={({ pressed }) =>
                        pressed ? { opacity: 0.9 } : null
                      }
                    >
                      <Text className="text-sm text-primary">Ver detalle</Text>
                    </Pressable>
                  </Link>
                  {proofLink(item)}
                </View>
              }
            />
            {confirmable && (
              <View className="border-t border-border bg-muted/40 px-4 py-3">
                <ConfirmReservationBlock
                  reservation={item}
                  onConfirmed={onConfirmed}
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
          onPress={
            confirmable ? undefined : () => router.push(detailHref(item.id))
          }
          action={
            <View className="gap-2">
              {confirmable && detailLink(item.id)}
              <ConfirmReservationBlock
                reservation={item}
                onConfirmed={onConfirmed}
              />
            </View>
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
