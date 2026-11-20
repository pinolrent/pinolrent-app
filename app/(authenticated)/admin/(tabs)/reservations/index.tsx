import { useEffect, useState } from 'react'
import { FlatList, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useAdminReservations } from '@/hooks/useAdmin'
import { useTransientNotice } from '@/hooks/useTransientNotice'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { AdminReservationRow } from '@/components/admin-rows'
import { ListFooter, FilterPills } from '@/components/admin-list'
import {
  AdminConfirmReservationBlock,
  AdminRequestCorrectionBlock,
} from '@/components/ReservationActions'
import {
  AppCard,
  EmptyState,
  ErrorState,
  AppRefreshControl,
  SuccessNote,
} from '@/components/ui-kit'
import { SkeletonList } from '@/components/Skeleton'
import { STATUS_LABELS } from '@/constants/reservation-ui'
import type { Reservation } from '@/types/reservation'

const STATUS_OPTIONS: { value: Reservation['status'] | ''; label: string }[] = [
  { value: '', label: 'Todas' },
  ...(
    ['pending', 'accepted', 'confirmed', 'rejected', 'cancelled'] as const
  ).map((status) => ({ value: status, label: STATUS_LABELS[status] })),
]

const STATUS_VALUES = STATUS_OPTIONS.map((option) => option.value)

// El aviso de comprobante nuevo y los números del panel llegan con ?status=:
// la lista ya viene filtrada en vez de obligar a buscar la cola a mano.
function statusFromParams(raw?: string): Reservation['status'] | '' {
  return STATUS_VALUES.includes((raw ?? '') as Reservation['status'])
    ? (raw as Reservation['status'])
    : ''
}

export default function AdminReservationsScreen() {
  const params = useLocalSearchParams<{ status?: string }>()
  const paramStatus = statusFromParams(params.status)
  const [status, setStatus] = useState<Reservation['status'] | ''>(paramStatus)

  // Se llega otra vez desde otro aviso: el filtro sigue al enlace.
  useEffect(() => {
    setStatus(paramStatus)
  }, [paramStatus])
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
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
            data={reservations}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item, index }) => (
                                <AdminReservationRow
                first={index === 0}
                last={index === reservations.length - 1}
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
            )}
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
              <EmptyState
                message={
                  status
                    ? 'No hay reservas con ese estado'
                    : 'Todavía no hay reservas'
                }
              />
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
