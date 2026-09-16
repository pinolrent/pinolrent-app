import { Pressable, Text, View } from 'react-native'
import { SkeletonList } from '@/components/Skeleton'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { useSellerCars } from '@/hooks/useSellerCars'
import { useSellerReservations } from '@/hooks/useReservations'
import { formatPrice } from '@/utils/currency'
import { daysBetween } from '@/utils/dates'
import { getApiErrorMessage } from '@/utils/errors'
import {
  AppCard,
  ErrorState,
  ListGroup,
  ListRow,
} from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { ScreenShell } from '@/components/ScreenShell'
import { useThemeColors } from '@/hooks/useThemeColors'

export default function SellerHomeScreen() {
  const router = useRouter()
  const colors = useThemeColors()
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
    <ScreenShell title="Inicio" width="form">
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ver las reservas por confirmar"
              onPress={() =>
                router.push('/(authenticated)/seller/reservations')
              }
              style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
            >
              <AppCard>
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
            </Pressable>
          ) : null}

          <ListGroup title="Resumen">
            <ListRow>
              <Text className="text-sm text-muted-foreground">
                Autos publicados
              </Text>
              <Text className="text-base text-foreground">
                {cars?.length ?? 0}
              </Text>
            </ListRow>
            <ListRow>
              <Text className="text-sm text-muted-foreground">
                Por confirmar
              </Text>
              {pendingPay > 0 ? (
                <StatusBadge tone="warning">{pendingPay}</StatusBadge>
              ) : (
                <Text className="text-base text-foreground">0</Text>
              )}
            </ListRow>
            <ListRow>
              <Text className="text-sm text-muted-foreground">Confirmadas</Text>
              <Text className="text-base text-foreground">{confirmed}</Text>
            </ListRow>
            <ListRow last>
              <Text className="text-sm text-muted-foreground">
                Ingresos confirmados
              </Text>
              <Text className="text-base font-semibold text-foreground">
                {formatPrice(earnings)}
              </Text>
            </ListRow>
          </ListGroup>
        </View>
      )}
    </ScreenShell>
  )
}
