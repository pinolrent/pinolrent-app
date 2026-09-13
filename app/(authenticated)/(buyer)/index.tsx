import { Text, View } from 'react-native'
import { SkeletonList } from '@/components/Skeleton'
import { useRouter } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { useMyReservations } from '@/hooks/useReservations'
import { getApiErrorMessage } from '@/utils/errors'
import { formatPrice } from '@/utils/currency'
import { daysBetween, formatDateRange, formatDays, toISO } from '@/utils/dates'
import { AppButton, AppCard, FormError, StatCard } from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { CarRow } from '@/components/rows'
import { ScreenShell } from '@/components/ScreenShell'
import { STATUS_LABELS, STATUS_TONES } from '@/constants/reservation-ui'
import { useBreakpoints } from '@/hooks/useBreakpoints'

export default function BuyerHomeScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const { isPhone } = useBreakpoints()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useMyReservations()

  const loadError = isError
    ? getApiErrorMessage(error, 'Error al cargar tus reservas')
    : null

  const reservations = data ?? []
  const pending = reservations.filter((r) => r.status === 'pending').length
  const confirmed = reservations.filter((r) => r.status === 'confirmed').length
  const today = toISO(new Date())
  const upcoming = reservations
    .filter((r) => r.status !== 'cancelled' && r.end_date >= today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date))[0]

  const metrics = (
    <View className="flex-row gap-3">
      <StatCard label="Pendientes" value={String(pending)} />
      <StatCard label="Confirmadas" value={String(confirmed)} />
    </View>
  )

  return (
    <ScreenShell title="Panel de comprador" subtitle={`Hola, ${user?.email}`}>
      {isLoading ? (
        <SkeletonList count={2} />
      ) : loadError ? (
        <View className="items-center gap-3 py-8">
          <FormError message={loadError} />
          <AppButton onPress={() => refetch()} loading={isRefetching}>
            Reintentar
          </AppButton>
        </View>
      ) : (
        <View className={isPhone ? 'gap-4' : 'flex-row items-start gap-6'}>
          <View className="flex-1 gap-4">
            {upcoming ? (
              <AppCard className="gap-3">
                <Text className="text-sm text-muted-foreground">
                  Tu próxima reserva
                </Text>
                <CarRow
                  car={upcoming.car}
                  meta={
                    <Text className="text-sm text-foreground">
                      {formatDateRange(upcoming.start_date, upcoming.end_date)} ·{' '}
                      {formatDays(
                        daysBetween(upcoming.start_date, upcoming.end_date)
                      )}
                    </Text>
                  }
                  trailing={
                    <StatusBadge tone={STATUS_TONES[upcoming.status]}>
                      {STATUS_LABELS[upcoming.status]}
                    </StatusBadge>
                  }
                />
                <Text className="text-sm font-semibold text-foreground">
                  {formatPrice(
                    daysBetween(upcoming.start_date, upcoming.end_date) *
                      upcoming.car.price_per_day
                  )}
                </Text>
                <AppButton
                  variant="outline"
                  onPress={() =>
                    router.push(
                      `/(authenticated)/(buyer)/reservations/${upcoming.id}`
                    )
                  }
                >
                  Ver reserva
                </AppButton>
              </AppCard>
            ) : (
              <AppCard className="gap-3">
                <Text className="text-sm text-muted-foreground">
                  Sin reservas por delante
                </Text>
                <Text className="text-base text-foreground">
                  Elige un auto y reserva tus fechas.
                </Text>
                <AppButton
                  onPress={() =>
                    router.push('/(authenticated)/(buyer)/catalog')
                  }
                >
                  Explorar autos
                </AppButton>
              </AppCard>
            )}
          </View>
          <View className={isPhone ? 'gap-4' : 'w-80 gap-4'}>
            {metrics}
            <View className="gap-3">
              <AppButton
                onPress={() =>
                  router.push('/(authenticated)/(buyer)/reservations')
                }
              >
                Mis reservas
              </AppButton>
              <AppButton
                variant="outline"
                onPress={() => router.push('/(authenticated)/(buyer)/catalog')}
              >
                Explorar autos
              </AppButton>
            </View>
          </View>
        </View>
      )}
    </ScreenShell>
  )
}
