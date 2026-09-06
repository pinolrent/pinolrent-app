import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { Button, ButtonText } from '../../../components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useSellerCars } from '@/hooks/useSellerCars'
import { useSellerReservations } from '@/hooks/useReservations'
import { formatPrice } from '@/utils/currency'
import { getApiErrorMessage } from '@/utils/errors'

function rentalDays(start: string, end: string) {
  const s = new Date(`${start}T00:00:00Z`).getTime()
  const e = new Date(`${end}T00:00:00Z`).getTime()
  return Math.round((e - s) / 86400000) + 1
}

export default function SellerHomeScreen() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { data: cars, isLoading: carsLoading } = useSellerCars()
  const { data: reservations, isLoading: resLoading } = useSellerReservations()

  const pendingPay = reservations?.filter(
    (r) => r.status === 'pending' && r.payment?.status === 'pending'
  ).length ?? 0
  const confirmed = reservations?.filter((r) => r.status === 'confirmed').length ?? 0
  const earnings = (reservations ?? [])
    .filter((r) => r.status === 'confirmed')
    .reduce((acc, r) => acc + rentalDays(r.start_date, r.end_date) * r.car.price_per_day, 0)

  const logoutError = logout.isError
    ? getApiErrorMessage(logout.error, 'Error al cerrar sesión')
    : null

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de vendedor</Text>
      <Text style={styles.subtitle}>Hola, {user?.email}</Text>

      {carsLoading || resLoading ? (
        <ActivityIndicator />
      ) : (
        <Text style={styles.subtitle}>
          {cars?.length ?? 0} autos · {pendingPay} por confirmar · {confirmed} confirmadas
        </Text>
      )}
      {!resLoading && (
        <Text style={styles.subtitle}>
          Ingresos confirmados: {formatPrice(earnings)}
        </Text>
      )}

      <Button
        variant="default"
        onPress={() => router.push('/(authenticated)/(seller)/cars')}
      >
        <ButtonText>Mis autos</ButtonText>
      </Button>
      <Button
        variant="default"
        onPress={() => router.push('/(authenticated)/(seller)/reservations')}
      >
        <ButtonText>Reservas</ButtonText>
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