import { Text, View } from 'react-native'
import { SkeletonList } from '@/components/Skeleton'
import { useRouter } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { useSellerCars } from '@/hooks/useSellerCars'
import { useSellerReservations } from '@/hooks/useReservations'
import { formatPrice } from '@/utils/currency'
import { daysBetween } from '@/utils/dates'
import { getApiErrorMessage } from '@/utils/errors'
import { AppButton, AppCard, FormError, StatCard } from '@/components/ui-kit'
import { ScreenShell } from '@/components/ScreenShell'
import { useBreakpoints } from '@/hooks/useBreakpoints'

export default function SellerHomeScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const { isPhone } = useBreakpoints()
  const {
    data: cars,
    isLoading: carsLoading,
    isError: carsError,
    error: carsErr,
    refetch: refetchCars,
    isRefetching: carsRefetching,
  } = useSellerCars()
  const {
    data: reservations,
    isLoading: resLoading,
    isError: resError,
    error: resErr,
    refetch: refetchRes,
    isRefetching: resRefetching,
  } = useSellerReservations()

  const loadError = carsError
    ? getApiErrorMessage(carsErr, 'Error al cargar tus autos')
    : resError
      ? getApiErrorMessage(resErr, 'Error al cargar tus reservas')
      : null

  const list = reservations ?? []
  const pendingPay = list.filter(
    (r) => r.status === 'pending' && r.payment?.status === 'pending'
  ).length
  const confirmed = list.filter((r) => r.status === 'confirmed').length
  const earnings = list
    .filter((r) => r.status === 'confirmed')
    .reduce(
      (acc, r) =>
        acc + daysBetween(r.start_date, r.end_date) * r.car.price_per_day,
      0
    )

  return (
    <ScreenShell title="Panel de vendedor" subtitle={`Hola, ${user?.email}`}>
      {carsLoading || resLoading ? (
        <SkeletonList count={2} />
      ) : loadError ? (
        <View className="items-center gap-3 py-8">
          <FormError message={loadError} />
          <AppButton
            onPress={() => {
              refetchCars()
              refetchRes()
            }}
            loading={carsRefetching || resRefetching}
          >
            Reintentar
          </AppButton>
        </View>
      ) : (
        <View className={isPhone ? 'gap-4' : 'flex-row items-start gap-6'}>
          <View className="flex-1 gap-3">
            <View className="flex-row gap-3">
              <StatCard label="Autos" value={String(cars?.length ?? 0)} />
              <StatCard label="Pendientes" value={String(pendingPay)} />
            </View>
            <View className="flex-row gap-3">
              <StatCard label="Confirmadas" value={String(confirmed)} />
              <StatCard label="Ingresos" value={formatPrice(earnings)} />
            </View>
          </View>
          <View className={isPhone ? 'gap-4' : 'w-80 gap-4'}>
            <AppCard className="gap-2">
              <Text className="text-sm text-muted-foreground">
                {pendingPay > 0
                  ? `${pendingPay} ${pendingPay === 1 ? 'reserva espera' : 'reservas esperan'} tu confirmación`
                  : 'Todo confirmado'}
              </Text>
              <Text className="text-base text-foreground">
                {pendingPay > 0
                  ? 'Revisa el comprobante y confirma para cerrar la reserva.'
                  : 'No hay pagos pendientes de revisar.'}
              </Text>
            </AppCard>
            <View className="gap-3">
              <AppButton
                onPress={() =>
                  router.push('/(authenticated)/(seller)/reservations')
                }
              >
                Revisar reservas
              </AppButton>
              <AppButton
                variant="outline"
                onPress={() => router.push('/(authenticated)/(seller)/cars')}
              >
                Mis autos
              </AppButton>
            </View>
          </View>
        </View>
      )}
    </ScreenShell>
  )
}
