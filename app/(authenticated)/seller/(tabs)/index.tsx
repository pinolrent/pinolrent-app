import { Text, View } from 'react-native'
import { SkeletonList } from '@/components/Skeleton'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { useSellerCars } from '@/hooks/useSellerCars'
import { useSellerReservations } from '@/hooks/useReservations'
import { formatPrice } from '@/utils/currency'
import { getApiErrorMessage } from '@/utils/errors'
import { reservationPricing } from '@/utils/reservations'
import {
  AppCard,
  AppPressable,
  ErrorState,
  Metric,
  SectionLabel,
} from '@/components/ui-kit'
import { ReservationRow } from '@/components/rows'
import { ScreenShell } from '@/components/ScreenShell'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { SUMMARY_LIMIT } from '@/constants/lists'
import { useThemeColors } from '@/hooks/useThemeColors'

export default function SellerHomeScreen() {
  const router = useRouter()
  const colors = useThemeColors()
  const { isWide } = useBreakpoints()
  const {
    data: cars,
    isLoading: carsLoading,
    isError: carsError,
    error: carsErr,
    refetch: refetchCars,
    isRefetching: carsRefetching,
  } = useSellerCars(SUMMARY_LIMIT)
  const {
    data: reservations,
    isLoading: resLoading,
    isError: resError,
    error: resErr,
    refetch: refetchRes,
    isRefetching: resRefetching,
  } = useSellerReservations(SUMMARY_LIMIT)

  const loadError = carsError
    ? getApiErrorMessage(carsErr, 'Error al cargar tus autos')
    : resError
      ? getApiErrorMessage(resErr, 'Error al cargar tus reservas')
      : null

  const allCars = cars?.pages.flatMap((page) => page) ?? []
  const activeCars = allCars.filter((car) => car.active).length
  const list = reservations?.pages.flatMap((page) => page) ?? []
  const toAnswer = list.filter((r) => r.status === 'pending').length
  const accepted = list.filter((r) => r.status === 'accepted').length
  const confirmed = list.filter((r) => r.status === 'confirmed').length
  // La reserva no trae fecha de alta en el contrato, así que el orden lo da el
  // id, que es creciente: las últimas tres que entraron.
  const latest = [...list].sort((a, b) => b.id - a.id).slice(0, 3)
  const earnings = list
    .filter((r) => r.status === 'confirmed')
    .reduce(
      (acc, r) =>
        acc +
        reservationPricing(r.start_date, r.end_date, r.car.price_per_day)
          .sellerNet,
      0
    )

  return (
    <ScreenShell title="Inicio" width={isWide ? 'default' : 'form'} scroll>
      {carsLoading || resLoading ? (
        <SkeletonList count={4} variant="row" label="Cargando tu resumen" />
      ) : loadError ? (
        <ErrorState
          message={loadError}
          onRetry={() => {
            refetchCars()
            refetchRes()
          }}
          retrying={carsRefetching || resRefetching}
        />
      ) : (
        <View className="gap-6">
          {toAnswer > 0 ? (
            <AppCard
              onPress={() => router.push('/(authenticated)/seller/reservations')}
              accessibilityLabel="Ver las reservas por responder"
            >
              <View className="flex-row items-center justify-between gap-3">
                <Text className="flex-1 text-base font-semibold text-foreground">
                  {toAnswer === 1
                    ? '1 reserva espera tu respuesta'
                    : `${toAnswer} reservas esperan tu respuesta`}
                </Text>
                <ChevronRight size={20} color={colors.mutedText} />
              </View>
              <Text className="text-sm text-muted-foreground">
                Acéptala o recházala: la plataforma valida el pago después.
              </Text>
            </AppCard>
          ) : null}

          <View className="gap-2">
            <SectionLabel>Resumen</SectionLabel>
            <View className="flex-row flex-wrap gap-3">
              <Metric label="Autos activos" value={String(activeCars)} />
              <Metric label="Aceptadas" value={String(accepted)} />
              <Metric label="Confirmadas" value={String(confirmed)} />
              <Metric
                label="Ingresos confirmados"
                value={formatPrice(earnings)}
              />
            </View>
          </View>

          {/* Últimas reservas: el hueco del inicio con datos reales, y con la
              misma forma que la pantalla de reservas para que se lean igual. */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <SectionLabel>Últimas reservas</SectionLabel>
              <AppPressable
                accessibilityRole="link"
                accessibilityLabel="Ver todas las reservas"
                onPress={() =>
                  router.push('/(authenticated)/seller/reservations')
                }
                className="min-h-11 justify-center px-1"
              >
                <Text className="text-sm font-semibold text-primary">
                  Ver todas
                </Text>
              </AppPressable>
            </View>
            {latest.length === 0 ? (
              <AppCard>
                <Text className="text-sm text-muted-foreground">
                  Todavía no tenés reservas. Cuando un comprador reserve un auto
                  tuyo, aparece acá.
                </Text>
              </AppCard>
            ) : (
              <View className="overflow-hidden">
                {latest.map((reservation, index) => (
                  <ReservationRow
                    key={reservation.id}
                    reservation={reservation}
                    audience="seller"
                    columns={isWide}
                    first={index === 0}
                    last={index === latest.length - 1}
                    onPress={() =>
                      router.push(
                        `/(authenticated)/seller/reservations/${reservation.id}`
                      )
                    }
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      )}
    </ScreenShell>
  )
}
