import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useMyReservations } from '@/hooks/useReservations'
import type { Reservation } from '@/types/reservation'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { ReservationColumns, ReservationRow } from '@/components/rows'
import { AppButton, EmptyState, FormError } from '@/components/ui-kit'
import { SkeletonList } from '@/components/Skeleton'
import { useBreakpoints } from '@/hooks/useBreakpoints'

export default function ReservationsScreen() {
  const router = useRouter()
  const { isDesktop } = useBreakpoints()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useMyReservations()

  const reservations = data ?? []
  const pending = reservations.filter((r) => r.status === 'pending').length

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar las reservas')
    : null

  const renderItem = ({ item }: { item: Reservation }) => (
    <View className={isDesktop ? 'border-b border-border' : undefined}>
      <ReservationRow
        reservation={item}
        columns={isDesktop}
        action={
          <Link
            href={`/(authenticated)/(buyer)/reservations/${item.id}`}
            asChild
          >
            <Pressable
              accessibilityRole="link"
              className="min-h-11 justify-center"
            >
              <Text className="text-sm text-primary">Ver detalle</Text>
            </Pressable>
          </Link>
        }
      />
    </View>
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
        <SkeletonList count={4} />
      ) : isError ? (
        <View className="items-center gap-3 py-8">
          <FormError message={errorMessage} />
          <AppButton onPress={() => refetch()}>Reintentar</AppButton>
        </View>
      ) : (
        <FlatList
          className="flex-1"
          contentContainerStyle={
            isDesktop ? { paddingBottom: 16 } : { gap: 12, paddingBottom: 16 }
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
      )}
    </ScreenShell>
  )
}
