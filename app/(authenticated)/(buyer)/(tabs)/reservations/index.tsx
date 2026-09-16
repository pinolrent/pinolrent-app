import { useEffect, useState } from 'react'
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { useMyReservations } from '@/hooks/useReservations'
import type { Reservation } from '@/types/reservation'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { ReservationColumns, ReservationRow } from '@/components/rows'
import { AppButton, EmptyState, ErrorState, SuccessNote } from '@/components/ui-kit'
import { SkeletonList } from '@/components/Skeleton'
import { StaggerCard } from '@/components/StaggerCard'
import { useBreakpoints } from '@/hooks/useBreakpoints'

export default function ReservationsScreen() {
  const router = useRouter()
  const { isDesktop } = useBreakpoints()
  const { created } = useLocalSearchParams<{ created?: string }>()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useMyReservations()
  const [createdNotice, setCreatedNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!created) return
    setCreatedNotice(
      `Reserva #${created} creada, queda pendiente de confirmación`
    )
    router.setParams({ created: '' })
  }, [created, router])

  const reservations = data ?? []
  const pending = reservations.filter((r) => r.status === 'pending').length

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar tus reservas')
    : null

  const renderItem = ({ item, index }: { item: Reservation; index: number }) => (
    <StaggerCard index={index}>
      <View className={isDesktop ? 'border-b border-border' : undefined}>
        <ReservationRow
          reservation={item}
          columns={isDesktop}
          onPress={
            isDesktop
              ? undefined
              : () =>
                  router.push(
                    `/(authenticated)/(buyer)/reservations/${item.id}`
                  )
          }
          action={
            isDesktop ? (
              <Link
                href={`/(authenticated)/(buyer)/reservations/${item.id}`}
                asChild
              >
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel="Ver detalle de la reserva"
                  className="min-h-11 justify-center"
                  style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
                >
                  <Text className="text-sm text-primary">Ver detalle</Text>
                </Pressable>
              </Link>
            ) : undefined
          }
        />
      </View>
    </StaggerCard>
  )

  return (
    <ScreenShell
      title="Mis reservas"
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
          <SuccessNote message={createdNotice} />
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
              <EmptyState
                message="Todavía no reservaste ningún auto"
                action={
                  <AppButton
                    onPress={() =>
                      router.push('/(authenticated)/(buyer)/catalog')
                    }
                  >
                    Explorar autos
                  </AppButton>
                }
              />
            }
          />
        </View>
      )}
    </ScreenShell>
  )
}
