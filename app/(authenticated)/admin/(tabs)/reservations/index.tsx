import { useState } from 'react'
import { FlatList, RefreshControl, View } from 'react-native'
import { useAdminReservations } from '@/hooks/useAdmin'
import { useTransientNotice } from '@/hooks/useTransientNotice'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { AdminReservationRow } from '@/components/admin-rows'
import { AdminListFooter, FilterPills } from '@/components/admin-list'
import {
  AdminConfirmReservationBlock,
  AdminRequestCorrectionBlock,
} from '@/components/ReservationActions'
import {
  AppCard,
  EmptyState,
  ErrorState,
  SuccessNote,
} from '@/components/ui-kit'
import { SkeletonList } from '@/components/Skeleton'
import { StaggerCard } from '@/components/StaggerCard'
import { useThemeColors } from '@/hooks/useThemeColors'
import { STATUS_LABELS } from '@/constants/reservation-ui'
import type { Reservation } from '@/types/reservation'

const STATUS_OPTIONS: { value: Reservation['status'] | ''; label: string }[] = [
  { value: '', label: 'Todas' },
  ...(
    ['pending', 'accepted', 'confirmed', 'rejected', 'cancelled'] as const
  ).map((status) => ({ value: status, label: STATUS_LABELS[status] })),
]

export default function AdminReservationsScreen() {
  const colors = useThemeColors()
  const [status, setStatus] = useState<Reservation['status'] | ''>('')
  const [notice, setNotice] = useTransientNotice()
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
  } = useAdminReservations({ status: status || undefined })

  const reservations = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.total ?? 0
  const loadMore = () => {
    void fetchNextPage()
  }

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar las reservas')
    : null

  return (
    <ScreenShell
      title="Reservas"
      subtitle={
        isLoading ? undefined : `${reservations.length} de ${total} en total`
      }
    >
      <View className="pb-3">
        <AppCard>
          <FilterPills
            label="Filtrar por estado"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(next) => {
              setNotice(null)
              setStatus(next)
            }}
          />
        </AppCard>
      </View>
      {isLoading ? (
        <SkeletonList count={4} label="Cargando las reservas" />
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
            contentContainerStyle={{ flexGrow: 1, gap: 12, paddingBottom: 16 }}
            data={reservations}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item, index }) => (
              <StaggerCard index={index}>
                <View className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                  <AdminReservationRow
                    reservation={item}
                    action={
                      item.status === 'accepted' ? (
                        <>
                          <AdminConfirmReservationBlock
                            reservationId={item.id}
                            carName={item.car_name}
                            onDone={() =>
                              setNotice(`Reserva #${item.id} confirmada`)
                            }
                          />
                          <AdminRequestCorrectionBlock
                            reservationId={item.id}
                            carName={item.car_name}
                            onDone={() =>
                              setNotice(
                                `Reserva #${item.id}: se pidió un comprobante nuevo`
                              )
                            }
                          />
                        </>
                      ) : undefined
                    }
                  />
                </View>
              </StaggerCard>
            )}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => refetch()}
                tintColor={colors.primary}
                colors={[colors.primary]}
                progressBackgroundColor={colors.card}
              />
            }
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) loadMore()
            }}
            onEndReachedThreshold={0.4}
            ListEmptyComponent={
              <EmptyState
                message={
                  status
                    ? 'No hay reservas con ese estado'
                    : 'Todavía no hay reservas'
                }
              />
            }
            ListFooterComponent={
              <AdminListFooter
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
