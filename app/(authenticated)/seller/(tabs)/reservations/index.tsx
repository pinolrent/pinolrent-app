import { FlatList, Text, View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useSellerReservations } from '@/hooks/useReservations'
import { useTransientNotice } from '@/hooks/useTransientNotice'
import type { Reservation } from '@/types/reservation'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { ListFooter } from '@/components/admin-list'
import { ProofLink } from '@/components/ProofLink'
import { ReservationColumns, ReservationRow } from '@/components/rows'
import {
  AcceptReservationBlock,
  RejectReservationBlock,
  canDecideReservation,
} from '@/components/ReservationActions'
import {
  AppPressable,
  EmptyState,
  ErrorState,
  SuccessNote,
  AppRefreshControl,
} from '@/components/ui-kit'
import { SkeletonList } from '@/components/Skeleton'
import { StaggerCard } from '@/components/StaggerCard'
import { useBreakpoints } from '@/hooks/useBreakpoints'

export default function SellerReservationsScreen() {
  const router = useRouter()
  const { contentWidth } = useBreakpoints()
  // La tabla fija 688px de columnas más la celda del auto: por debajo de
  // 880 el auto queda aplastado y las tarjetas leen mejor.
  const showTable = contentWidth >= 880
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = useSellerReservations()
  const [notice, setNotice] = useTransientNotice()

  const reservations = data?.pages.flatMap((page) => page) ?? []
  const pending = reservations.filter((r) => r.status === 'pending').length
  const pendingLabel = `${pending} por responder`
  const loadMore = () => {
    void fetchNextPage()
  }

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar tus reservas')
    : null

  const onAccepted = (reservation: Reservation) => {
    setNotice(`Reserva #${reservation.id} aceptada`)
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
    const decidable = canDecideReservation(item)

    if (showTable) {
      return (
        <StaggerCard index={index}>
          <View className="border-b border-border">
            <ReservationRow
              reservation={item}
              columns
              audience="seller"
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
            {decidable && (
              <View className="flex-row items-center gap-2 border-t border-border bg-muted/40 px-4 py-3">
                <AcceptReservationBlock
                  reservation={item}
                  onAccepted={onAccepted}
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
          audience="seller"
          onPress={() => router.push(detailHref(item.id))}
          action={
            decidable ? (
              <View className="gap-2">
                <AcceptReservationBlock
                  reservation={item}
                  onAccepted={onAccepted}
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
          : `${reservations.length} mostradas · ${pendingLabel}`
      }
    >
      {isLoading ? (
        <SkeletonList
          count={4}
          variant="cardRow"
          label="Cargando tus reservas"
        />
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
              showTable
                ? { flexGrow: 1, paddingBottom: 16 }
                : { flexGrow: 1, gap: 12, paddingBottom: 16 }
            }
            data={reservations}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            ListHeaderComponent={
              showTable && reservations.length > 0 ? (
                <ReservationColumns audience="seller" />
              ) : null
            }
            refreshControl={
              <AppRefreshControl
                refreshing={isRefetching}
                onRefresh={() => refetch()}
              />
            }
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) loadMore()
            }}
            onEndReachedThreshold={0.4}
            ListEmptyComponent={
              <EmptyState message="Todavía no recibiste ninguna reserva" />
            }
            ListFooterComponent={
              <ListFooter
                hasNextPage={Boolean(hasNextPage)}
                isFetchingNextPage={isFetchingNextPage}
                isFetchNextPageError={isFetchNextPageError}
                onLoadMore={loadMore}
              />
            }
          />
        </View>
      )}
    </ScreenShell>
  )
}
