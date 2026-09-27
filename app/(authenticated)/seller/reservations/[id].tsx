import { View, Text, ScrollView, RefreshControl } from 'react-native'
import Animated from 'react-native-reanimated'
import { useLocalSearchParams } from 'expo-router'
import { useReservation } from '@/hooks/useReservations'
import { useTransientNotice } from '@/hooks/useTransientNotice'
import { STATUS_LABELS, STATUS_TONES } from '@/constants/reservation-ui'
import { formatPrice, formatPricePerDay } from '@/utils/currency'
import { formatDateRange, formatDays } from '@/utils/dates'
import { reservationTotal } from '@/utils/reservations'
import { getApiErrorMessage } from '@/utils/errors'
import { useReduceMotion } from '@/hooks/useReduceMotion'
import { enterFade } from '@/constants/motion'
import { ScreenShell } from '@/components/ScreenShell'
import { CarRow } from '@/components/rows'
import { AppCard, ErrorState, SuccessNote } from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { SkeletonList } from '@/components/Skeleton'
import { useDetailSplit } from '@/hooks/useDetailSplit'
import { useThemeColors } from '@/hooks/useThemeColors'
import { NUMERIC } from '@/constants/typography'
import {
  ConfirmReservationBlock,
  PaymentSummary,
  RejectReservationBlock,
} from '@/components/ReservationActions'

export default function SellerReservationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const idNum = Number(id)
  const invalidId = !Number.isFinite(idNum)
  const reduceMotion = useReduceMotion()
  const { isWide, container, main, side } = useDetailSplit()
  const colors = useThemeColors()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useReservation(idNum)
  const [notice, setNotice] = useTransientNotice()

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar la reserva')
    : null

  if (isLoading) {
    return (
      <ScreenShell topInset={false}>
        <SkeletonList count={1} variant="cardRow" label="Cargando la reserva" />
      </ScreenShell>
    )
  }

  if (invalidId || isError || !data) {
    return (
      <ScreenShell topInset={false}>
        <ErrorState
          message={
            invalidId
              ? 'No encontramos esa reserva'
              : (errorMessage ?? 'No encontramos esa reserva')
          }
          onRetry={invalidId ? undefined : () => refetch()}
          retrying={isRefetching}
          centered
        />
      </ScreenShell>
    )
  }

  const { days, total } = reservationTotal(
    data.start_date,
    data.end_date,
    data.car.price_per_day
  )

  return (
    <Animated.View
      entering={enterFade(reduceMotion)}
      className="flex-1"
    >
      <ScreenShell topInset={false}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.card}
            />
          }
        >
          <View className={container}>
            <View className={main}>
              <AppCard gap="lg">
                <CarRow
                  car={data.car}
                  trailing={
                    <StatusBadge tone={STATUS_TONES[data.status]}>
                      {STATUS_LABELS[data.status]}
                    </StatusBadge>
                  }
                />
                <View className={isWide ? 'flex-row gap-6' : 'gap-4'}>
                  <View className="flex-1 gap-1">
                    <Text className="text-sm text-muted-foreground">
                      Fechas
                    </Text>
                    <Text className="text-base text-foreground">
                      {formatDateRange(data.start_date, data.end_date)}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {formatDays(days)}
                    </Text>
                  </View>
                  <View className="flex-1 gap-1">
                    <Text className="text-sm text-muted-foreground">Pago</Text>
                    {data.payment ? (
                      <PaymentSummary payment={data.payment} />
                    ) : (
                      <Text className="text-base text-foreground">
                        Sin pago registrado
                      </Text>
                    )}
                  </View>
                </View>
              </AppCard>
            </View>
            <View className={side}>
              <AppCard gap="sm">
                <Text style={NUMERIC} className="text-sm text-muted-foreground">
                  {formatPricePerDay(data.car.price_per_day)}
                  {' × '}
                  {formatDays(days)}
                </Text>
                <Text style={NUMERIC} className="text-2xl font-bold text-foreground">
                  {formatPrice(total)}
                </Text>
              </AppCard>
              {notice && <SuccessNote message={notice} />}
              <ConfirmReservationBlock
                reservation={data}
                onConfirmed={(reservation) =>
                  setNotice(`Reserva #${reservation.id} confirmada`)
                }
              />
              <RejectReservationBlock
                reservation={data}
                onRejected={(reservation) =>
                  setNotice(`Reserva #${reservation.id} rechazada`)
                }
              />
            </View>
          </View>
        </ScrollView>
      </ScreenShell>
    </Animated.View>
  )
}
