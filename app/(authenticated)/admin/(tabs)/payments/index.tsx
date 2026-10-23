import { useState } from 'react'
import { FlatList, View } from 'react-native'
import { useAdminPayments } from '@/hooks/useAdmin'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { AdminPaymentRow } from '@/components/admin-rows'
import { ListFooter, FilterPills } from '@/components/admin-list'
import {
  AppCard,
  AppRefreshControl,
  CARD_SURFACE,
  EmptyState,
  ErrorState,
} from '@/components/ui-kit'
import { SkeletonList } from '@/components/Skeleton'
import { StaggerCard } from '@/components/StaggerCard'
import { PAYMENT_STATUS_LABELS } from '@/constants/payment-ui'
import type { Payment } from '@/types/payment'

const STATUS_OPTIONS: { value: Payment['status'] | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  ...(['pending', 'approved', 'rejected'] as const).map((status) => ({
    value: status,
    label: PAYMENT_STATUS_LABELS[status],
  })),
]

export default function AdminPaymentsScreen() {
  const [status, setStatus] = useState<Payment['status'] | ''>('')
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
  } = useAdminPayments({ status: status || undefined })

  const payments = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.total ?? 0
  const loadMore = () => {
    void fetchNextPage()
  }

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar los pagos')
    : null

  return (
    <ScreenShell
      title="Pagos"
      subtitle={isLoading ? undefined : `${payments.length} de ${total} en total`}
    >
      <View className="pb-3">
        <AppCard>
          <FilterPills
            label="Filtrar por estado"
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
          />
        </AppCard>
      </View>
      {isLoading ? (
        <SkeletonList count={4} variant="row" label="Cargando los pagos" />
      ) : isError ? (
        <ErrorState
          message={errorMessage}
          onRetry={() => refetch()}
          retrying={isRefetching}
          centered
        />
      ) : (
        <FlatList
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, gap: 12, paddingBottom: 16 }}
          data={payments}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <StaggerCard index={index}>
              <View className={`overflow-hidden ${CARD_SURFACE}`}>
                <AdminPaymentRow payment={item} />
              </View>
            </StaggerCard>
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
                status ? 'No hay pagos con ese estado' : 'Todavía no hay pagos'
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
      )}
    </ScreenShell>
  )
}
