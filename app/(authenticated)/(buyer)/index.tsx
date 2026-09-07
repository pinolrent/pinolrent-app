import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { Button, ButtonText } from '../../../components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useMyReservations } from '@/hooks/useReservations'
import { getApiErrorMessage } from '@/utils/errors'

export default function BuyerHomeScreen() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useMyReservations()

  const loadError = isError
    ? getApiErrorMessage(error, 'Error al cargar tus reservas')
    : null

  const pending = data?.filter((r) => r.status === 'pending').length ?? 0
  const confirmed = data?.filter((r) => r.status === 'confirmed').length ?? 0

  const logoutError = logout.isError
    ? getApiErrorMessage(logout.error, 'Error al cerrar sesión')
    : null

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de comprador</Text>
      <Text style={styles.subtitle}>Hola, {user?.email}</Text>

      {isLoading ? (
        <ActivityIndicator />
      ) : loadError ? (
        <>
          <Text style={styles.error}>{loadError}</Text>
          <Button
            variant="default"
            onPress={() => refetch()}
            disabled={isRefetching}
          >
            <ButtonText>Reintentar</ButtonText>
          </Button>
        </>
      ) : (
        <Text style={styles.subtitle}>
          {pending} pendientes · {confirmed} confirmadas
        </Text>
      )}

      <Button
        variant="default"
        onPress={() => router.push('/(authenticated)/(buyer)/catalog')}
      >
        <ButtonText>Explorar autos</ButtonText>
      </Button>
      <Button
        variant="default"
        onPress={() => router.push('/(authenticated)/(buyer)/reservations')}
      >
        <ButtonText>Mis reservas</ButtonText>
      </Button>

      {logoutError && <Text style={styles.error}>{logoutError}</Text>}
      <Button
        variant="default"
        onPress={() => logout.mutate()}
        disabled={logout.isPending}
      >
        {logout.isPending ? (
          <ActivityIndicator />
        ) : (
          <ButtonText>Cerrar sesión</ButtonText>
        )}
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  subtitle: { color: '#aaa' },
  error: { color: '#ff6467' },
})