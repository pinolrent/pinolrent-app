import { useEffect, useState } from 'react'
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { useMyReservations } from '@/hooks/useReservations'
import type { Reservation } from '@/types/reservation'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { CancelReservationBlock } from '@/components/ReservationActions'
import { ReservationColumns, ReservationRow } from '@/components/rows'
import {
  AppButton,
  EmptyState,
  ErrorState,
  SuccessNote,
} from '@/components/ui-kit'
import { SkeletonList } from '@/components/Skeleton'
import { StaggerCard } from '@/components/StaggerCard'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useThemeColors } from '@/hooks/useThemeColors'

const NOTICE_MS = 6000

function canCancel(reservation: Reservation) {
  return reservation.status === 'pending' && !reservation.payment
}

export default function ReservationsScreen() {
  const router = useRouter()
  const colors = useThemeColors()
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

  useEffect(() => {
    if (!createdNotice) return
    const timer = setTimeout(() => setCreatedNotice(null), NOTICE_MS)
    return () => clearTimeout(timer)
  }, [createdNotice])

  const reservations = data ?? []
  const pending = reservations.filter((r) => r.status === 'pending').length
  const pendingLabel = `${pending} ${pending === 1 ? 'pendiente' : 'pendientes'}`

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar tus reservas')
    : null

  const detailHref = (id: number) =>
    `/(authenticated)/(buyer)/reservations/${id}`

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

  const renderItem = ({
    item,
    index,
  }: {
    item: Reservation
    index: number
  }) => {
    const cancellable = canCancel(item)

    if (isDesktop) {
      return (
        <StaggerCard index={index}>
          <View className="border-b border-border">
            <ReservationRow
              reservation={item}
              columns
              action={
                <Link href={detailHref(item.id)} asChild>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel="Ver detalle de la reserva"
                    className="min-h-11 justify-center"
                    style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
                  >
                    <Text className="text-sm text-primary">Ver detalle</Text>
                  </Pressable>
                </Link>
              }
            />
            {cancellable && (
              <View className="border-t border-border bg-muted/40 px-4 py-3">
                <CancelReservationBlock reservation={item} />
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
            cancellable ? undefined : () => router.push(detailHref(item.id))
          }
          action={
            <View className="gap-2">
              {cancellable && detailLink(item.id)}
              <CancelReservationBlock reservation={item} />
            </View>
          }
        />
      </StaggerCard>
    )
  }

  return (
    <ScreenShell
      title="Mis reservas"
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
          <SuccessNote message={createdNotice} />
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
