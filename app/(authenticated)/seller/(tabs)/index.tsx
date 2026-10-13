import { Text, View } from 'react-native'
import { SkeletonList } from '@/components/Skeleton'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { useSellerCars } from '@/hooks/useSellerCars'
import { useSellerReservations } from '@/hooks/useReservations'
import { formatPrice } from '@/utils/currency'
import { getApiErrorMessage } from '@/utils/errors'
import { reservationPricing } from '@/utils/reservations'
import { AppCard, ErrorState, Metric } from '@/components/ui-kit'
import { ScreenShell } from '@/components/ScreenShell'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { SECTION_LABEL } from '@/constants/typography'
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
            <Text
              accessibilityRole="header"
              style={SECTION_LABEL}
              className="px-1 text-xs font-semibold uppercase text-muted-foreground"
            >
              Resumen
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <Metric label="Autos activos" value={String(activeCars)} />
              <Metric
                label="Por responder"
                value={String(toAnswer)}
                tone={toAnswer > 0 ? 'text-warning' : 'text-foreground'}
              />
              <Metric label="Aceptadas" value={String(accepted)} />
              <Metric label="Confirmadas" value={String(confirmed)} />
              <Metric
                label="Ingresos confirmados"
                value={formatPrice(earnings)}
              />
            </View>
          </View>
        </View>
      )}
    </ScreenShell>
  )
}
