import { View, Text, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { useMyReservations } from '@/hooks/useReservations'
import { getApiErrorMessage } from '@/utils/errors'
import { AppButton, FormError, StatCard } from '@/components/ui-kit'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function BuyerHomeScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useMyReservations()

  const loadError = isError
    ? getApiErrorMessage(error, 'Error al cargar tus reservas')
    : null

  const pending = data?.filter((r) => r.status === 'pending').length ?? 0
  const confirmed = data?.filter((r) => r.status === 'confirmed').length ?? 0


  return (
    <View className="flex-1 gap-3 bg-background p-6">
      <View className="items-end">
        <ThemeToggle />
      </View>
      <Text className="text-2xl font-bold text-foreground">
        Panel de comprador
      </Text>
      <Text className="text-muted-foreground">Hola, {user?.email}</Text>

      {isLoading ? (
        <ActivityIndicator />
      ) : loadError ? (
        <View className="gap-2">
          <FormError message={loadError} />
          <AppButton onPress={() => refetch()} disabled={isRefetching}>
            Reintentar
          </AppButton>
        </View>
      ) : (
        <View className="flex-row gap-3">
          <StatCard label="Pendientes" value={String(pending)} />
          <StatCard label="Confirmadas" value={String(confirmed)} />
        </View>
      )}

      <AppButton
        onPress={() => router.push('/(authenticated)/(buyer)/reservations')}
      >
        Mis reservas
      </AppButton>
      <AppButton
        onPress={() => router.push('/(authenticated)/(buyer)/catalog')}
      >
        Explorar autos
      </AppButton>

    </View>
  )
}
