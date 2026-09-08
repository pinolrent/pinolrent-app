import { View, Text, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { useSellerCars } from '@/hooks/useSellerCars'
import { useSellerReservations } from '@/hooks/useReservations'
import { formatPrice } from '@/utils/currency'
import { daysBetween } from '@/utils/dates'
import { getApiErrorMessage } from '@/utils/errors'
import { AppButton, FormError, StatCard } from '@/components/ui-kit'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function SellerHomeScreen() {
  const { user } = useAuth()
  const router = useRouter()
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

  const pendingPay = reservations?.filter(
    (r) => r.status === 'pending' && r.payment?.status === 'pending'
  ).length ?? 0
  const confirmed = reservations?.filter((r) => r.status === 'confirmed').length ?? 0
  const earnings = (reservations ?? [])
    .filter((r) => r.status === 'confirmed')
    .reduce(
      (acc, r) =>
        acc + daysBetween(r.start_date, r.end_date) * r.car.price_per_day,
      0
    )


  return (
    <View className="flex-1 gap-3 bg-background p-6">
      <View className="items-end">
        <ThemeToggle />
      </View>
      <Text className="text-2xl font-bold text-foreground">
        Panel de vendedor
      </Text>
      <Text className="text-muted-foreground">Hola, {user?.email}</Text>

      {carsLoading || resLoading ? (
        <ActivityIndicator />
      ) : loadError ? (
        <View className="gap-2">
          <FormError message={loadError} />
          <AppButton
            onPress={() => {
              refetchCars()
              refetchRes()
            }}
            disabled={carsRefetching || resRefetching}
          >
            Reintentar
          </AppButton>
        </View>
      ) : (
        <View className="gap-3">
          <View className="flex-row gap-3">
            <StatCard label="Autos" value={String(cars?.length ?? 0)} />
            <StatCard label="Por confirmar" value={String(pendingPay)} />
          </View>
          <View className="flex-row gap-3">
            <StatCard label="Confirmadas" value={String(confirmed)} />
            <StatCard
              label="Ingresos"
              value={formatPrice(earnings)}
            />
          </View>
        </View>
      )}

      <AppButton
        onPress={() => router.push('/(authenticated)/(seller)/cars')}
      >
        Mis autos
      </AppButton>
      <AppButton
        onPress={() => router.push('/(authenticated)/(seller)/reservations')}
      >
        Reservas
      </AppButton>

    </View>
  )
}
