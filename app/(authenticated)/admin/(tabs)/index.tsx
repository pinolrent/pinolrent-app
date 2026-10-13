import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { useAdminStats } from '@/hooks/useAdmin'
import { formatPrice } from '@/utils/currency'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { AppCard, ErrorState, Metric } from '@/components/ui-kit'
import { SkeletonList } from '@/components/Skeleton'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useThemeColors } from '@/hooks/useThemeColors'
import { SECTION_LABEL } from '@/constants/typography'
import { PAYMENT_STATUS_LABELS } from '@/constants/payment-ui'
import { STATUS_LABELS } from '@/constants/reservation-ui'

const RESERVATION_STATUSES = [
  'pending',
  'accepted',
  'confirmed',
  'rejected',
  'cancelled',
] as const

const PAYMENT_STATUSES = ['pending', 'approved', 'rejected'] as const

export default function AdminPanelScreen() {
  const router = useRouter()
  const colors = useThemeColors()
  const { isWide } = useBreakpoints()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useAdminStats()

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar las métricas')
    : null

  return (
    <ScreenShell
      title="Panel"
      width={isWide ? 'default' : 'form'}
      scroll
    >
      {isLoading ? (
        <SkeletonList count={4} variant="row" label="Cargando las métricas" />
      ) : isError || !data ? (
        <ErrorState
          message={errorMessage ?? 'Error al cargar las métricas'}
          onRetry={() => refetch()}
          retrying={isRefetching}
        />
      ) : (
        <View className="gap-6">
          <View className="gap-2">
            <Text
              accessibilityRole="header"
              style={SECTION_LABEL}
              className="px-1 text-xs font-semibold uppercase text-muted-foreground"
            >
              Usuarios
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <Metric label="Cuentas" value={String(data.users.total)} />
              <Metric label="Vendedores" value={String(data.users.sellers)} />
              <Metric label="Admins" value={String(data.users.admins)} />
              <Metric
                label="Suspendidas"
                value={String(data.users.suspended)}
                tone={data.users.suspended > 0 ? 'text-warning' : undefined}
              />
            </View>
          </View>

          <View className="gap-2">
            <Text
              accessibilityRole="header"
              style={SECTION_LABEL}
              className="px-1 text-xs font-semibold uppercase text-muted-foreground"
            >
              Reservas
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {RESERVATION_STATUSES.map((status) => (
                <Metric
                  key={status}
                  label={STATUS_LABELS[status]}
                  value={String(data.reservations[status] ?? 0)}
                  tone={
                    status === 'pending' && data.reservations.pending > 0
                      ? 'text-warning'
                      : undefined
                  }
                />
              ))}
            </View>
          </View>

          <View className="gap-2">
            <Text
              accessibilityRole="header"
              style={SECTION_LABEL}
              className="px-1 text-xs font-semibold uppercase text-muted-foreground"
            >
              Pagos
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {PAYMENT_STATUSES.map((status) => (
                <Metric
                  key={status}
                  label={PAYMENT_STATUS_LABELS[status]}
                  value={String(data.payments[status] ?? 0)}
                />
              ))}
              <Metric
                label="Total aprobado"
                value={formatPrice(data.payments.approved_total)}
              />
            </View>
          </View>

          <View className="gap-2">
            <Text
              accessibilityRole="header"
              style={SECTION_LABEL}
              className="px-1 text-xs font-semibold uppercase text-muted-foreground"
            >
              Autos
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <Metric label="Activos" value={String(data.cars.active)} />
            </View>
          </View>

          <AppCard
            onPress={() => router.push('/(authenticated)/admin/audit')}
            accessibilityLabel="Ver la auditoría"
          >
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1 gap-1">
                <Text className="text-base font-semibold text-foreground">
                  Auditoría
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Quién suspendió, confirmó o rechazó, y cuándo.
                </Text>
              </View>
              <ChevronRight size={20} color={colors.mutedText} />
            </View>
          </AppCard>

          <AppCard
            onPress={() => router.push('/(authenticated)/admin/notifications')}
            accessibilityLabel="Ver las notificaciones"
          >
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1 gap-1">
                <Text className="text-base font-semibold text-foreground">
                  Notificaciones
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Lo que el sistema le avisó a cada cuenta.
                </Text>
              </View>
              <ChevronRight size={20} color={colors.mutedText} />
            </View>
          </AppCard>
        </View>
      )}
    </ScreenShell>
  )
}
