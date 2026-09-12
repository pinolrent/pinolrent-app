import { View, Text } from 'react-native'
import { SkeletonList } from '@/components/Skeleton'
import { useRouter } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { useMyReservations } from '@/hooks/useReservations'
import { getApiErrorMessage } from '@/utils/errors'
import { AppButton, FormError, StatCard } from '@/components/ui-kit'
import { MenuButton, type NavItem } from '@/components/SideNav'
import { useBreakpoints } from '@/hooks/useBreakpoints'

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


  const { isDesktop } = useBreakpoints()

  const items: NavItem[] = [
    { label: 'Inicio', href: '/(authenticated)/(buyer)', icon: 'home' },
    { label: 'Catálogo', href: '/(authenticated)/(buyer)/catalog', icon: 'catalog' },
    { label: 'Reservas', href: '/(authenticated)/(buyer)/reservations', icon: 'reservations' },
    { label: 'Perfil', href: '/(authenticated)/(buyer)/profile', icon: 'profile' },
  ]

  return (
    <View className="flex-1 gap-3 bg-background p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-foreground">
          Panel de comprador
        </Text>
        {!isDesktop && <MenuButton items={items} />}
      </View>
      <Text className="text-muted-foreground">Hola, {user?.email}</Text>

      {isLoading ? (
        <SkeletonList count={2} />
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
