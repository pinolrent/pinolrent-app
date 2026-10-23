import { View, Text, ScrollView } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import {
  useAdminUser,
  useSetUserSeller,
  useSetUserSuspended,
} from '@/hooks/useAdmin'
import { useAuth } from '@/hooks/useAuth'
import { useTransientNotice } from '@/hooks/useTransientNotice'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { ConfirmAction } from '@/components/ConfirmAction'
import {
  AppCard,
  ErrorState,
  SuccessNote,
  AppRefreshControl,
} from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { SkeletonList } from '@/components/Skeleton'
import { ROLE_LABELS } from '@/constants/admin-ui'
import { NUMERIC } from '@/constants/typography'

export default function AdminUserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const idNum = Number(id)
  const invalidId = !Number.isFinite(idNum)
  const { user: me } = useAuth()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useAdminUser(idNum)
  const suspend = useSetUserSuspended()
  const seller = useSetUserSeller()
  const [notice, setNotice] = useTransientNotice()

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar la cuenta')
    : null

  if (isLoading) {
    return (
      <ScreenShell topInset={false}>
        <Stack.Screen options={{ title: 'Cuenta' }} />
        <SkeletonList count={1} label="Cargando la cuenta" />
      </ScreenShell>
    )
  }

  if (invalidId || isError || !data) {
    return (
      <ScreenShell topInset={false}>
        <Stack.Screen options={{ title: 'Cuenta' }} />
        <ErrorState
          message={invalidId ? 'No encontramos esa cuenta' : errorMessage}
          onRetry={invalidId ? undefined : () => refetch()}
          retrying={isRefetching}
          centered
        />
      </ScreenShell>
    )
  }

  const isSuspended = Boolean(data.suspended_at)
  const isSeller = data.roles.includes('seller')
  const isSelf = me?.id === data.id

  return (
    <ScreenShell topInset={false}>
      <Stack.Screen options={{ title: data.email }} />
      <ScrollView
        className="flex-1"
        refreshControl={
          <AppRefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
          />
        }
      >
        <View className="max-w-md gap-4 pb-4">
          <AppCard gap="sm">
            <Text className="text-lg font-bold text-foreground">
              {data.email}
            </Text>
            <Text style={NUMERIC} className="text-sm text-muted-foreground">
              {data.phone || 'Sin teléfono'}
            </Text>
            <View className="flex-row flex-wrap items-center gap-2">
              {data.roles.map((role) => (
                <StatusBadge key={role} tone="muted">
                  {ROLE_LABELS[role]}
                </StatusBadge>
              ))}
              {isSuspended ? (
                <StatusBadge tone="destructive">Suspendida</StatusBadge>
              ) : null}
            </View>
          </AppCard>

          <SuccessNote message={notice} />

          <View className="gap-3">
            <ConfirmAction
              label={isSuspended ? 'Reactivar cuenta' : 'Suspender cuenta'}
              variant={isSuspended ? 'default' : 'destructive-outline'}
              title={isSuspended ? 'Reactivar cuenta' : 'Suspender cuenta'}
              message={
                isSuspended
                  ? `¿Reactivar ${data.email}? Recupera el acceso con la sesión que ya tenía.`
                  : `¿Suspender ${data.email}? Con un token válido recibirá 403 en todas las rutas hasta que la reactives.`
              }
              confirmLabel={isSuspended ? 'Reactivar' : 'Suspender'}
              destructive={!isSuspended}
              errorFallback="Error al cambiar el estado de la cuenta"
              action={() =>
                suspend.mutateAsync({
                  id: data.id,
                  suspended: !isSuspended,
                })
              }
              onDone={() =>
                setNotice(
                  isSuspended ? 'Cuenta reactivada' : 'Cuenta suspendida'
                )
              }
            />

            <ConfirmAction
              label={
                isSeller ? 'Quitar la opción de vender' : 'Habilitar como vendedor'
              }
              variant="outline"
              title={isSeller ? 'Quitar vendedor' : 'Habilitar vendedor'}
              message={
                isSeller
                  ? `¿Quitarle a ${data.email} la opción de vender? Sus autos y reservas quedan como están; no se puede si tiene reservas futuras.`
                  : `¿Habilitar a ${data.email} para vender? Necesita un teléfono de contacto registrado.`
              }
              confirmLabel={isSeller ? 'Quitar' : 'Habilitar'}
              errorFallback="Error al cambiar los roles"
              action={() =>
                seller.mutateAsync({ id: data.id, seller: !isSeller })
              }
              onDone={() =>
                setNotice(
                  isSeller ? 'Se quitó la opción de vender' : 'Ahora es vendedor'
                )
              }
            />
            {isSelf ? (
              <Text className="text-sm text-muted-foreground">
                Es tu propia cuenta: la API no deja suspenderte.
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </ScreenShell>
  )
}
