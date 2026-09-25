import { Text, View } from 'react-native'
import { SkeletonList } from '@/components/Skeleton'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { useSellerCars } from '@/hooks/useSellerCars'
import { useSellerReservations } from '@/hooks/useReservations'
import { formatPrice } from '@/utils/currency'
import { getApiErrorMessage } from '@/utils/errors'
import { reservationTotal } from '@/utils/reservations'
import { AppCard, ErrorState } from '@/components/ui-kit'
import { ScreenShell } from '@/components/ScreenShell'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useThemeColors } from '@/hooks/useThemeColors'

function Metric({
  label,
  value,
  tone = 'text-foreground',
}: {
  label: string
  value: string
  tone?: string
}) {
  return (
    <View className="min-w-[150px] flex-1 gap-1 rounded-xl border border-border bg-card p-4">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className={`text-2xl font-bold ${tone}`}>{value}</Text>
    </View>
  )
}

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

  const activeCars = (cars ?? []).filter((car) => car.active).length
  const list = reservations ?? []
  const pendingPay = list.filter(
    (r) => r.status === 'pending' && r.payment?.status === 'pending'
  ).length
  const confirmed = list.filter((r) => r.status === 'confirmed').length
  const earnings = list
    .filter((r) => r.status === 'confirmed')
    .reduce(
      (acc, r) =>
        acc +
        reservationTotal(r.start_date, r.end_date, r.car.price_per_day).total,
      0
    )

  return (
    <ScreenShell title="Inicio" width={isWide ? 'default' : 'form'} scroll>
      {carsLoading || resLoading ? (
        <SkeletonList count={4} variant="row" />
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
          {pendingPay > 0 ? (
            <AppCard
              onPress={() => router.push('/(authenticated)/seller/reservations')}
              accessibilityLabel="Ver las reservas por confirmar"
            >
              <View className="flex-row items-center justify-between gap-3">
                <Text className="flex-1 text-base font-semibold text-foreground">
                  {pendingPay === 1
                    ? '1 reserva espera tu confirmación'
                    : `${pendingPay} reservas esperan tu confirmación`}
                </Text>
                <ChevronRight size={20} color={colors.mutedText} />
              </View>
              <Text className="text-sm text-muted-foreground">
                Revisa el comprobante y confirma para cerrar la reserva.
              </Text>
            </AppCard>
          ) : null}

          <View className="gap-2">
            <Text
              accessibilityRole="header"
              className="px-1 text-xs font-semibold uppercase text-muted-foreground"
            >
              Resumen
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <Metric label="Autos activos" value={String(activeCars)} />
              <Metric
                label="Por confirmar"
                value={String(pendingPay)}
                tone={pendingPay > 0 ? 'text-warning' : 'text-foreground'}
              />
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
