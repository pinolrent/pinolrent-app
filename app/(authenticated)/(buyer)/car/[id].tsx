import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Button, ButtonText } from '../../../../components/ui/button'
import { useCar } from '@/hooks/useCars'
import { CarImage } from '@/components/CarImage'
import { formatPrice } from '@/utils/currency'
import { getApiErrorMessage } from '@/utils/errors'

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const idNum = Number(id)
  const invalidId = !Number.isFinite(idNum)
  const { data: car, isLoading, isError, error, refetch } = useCar(idNum)

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar el auto')
    : null

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (invalidId || isError || !car) {
    return (
      <View style={styles.center}>
        <Text style={styles.subtitle}>
          {invalidId ? 'ID de auto inválido' : (errorMessage ?? 'No se encontró el auto')}
        </Text>
        {!invalidId && (
          <Button variant="default" onPress={() => refetch()}>
            <ButtonText>Reintentar</ButtonText>
          </Button>
        )}
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <CarImage uri={car.photo_url} name={car.name} />
      <Text style={styles.title}>{car.name}</Text>
      <Text style={styles.subtitle}>Precio por día: {formatPrice(car.price_per_day)}</Text>
      <Button
        variant="default"
        onPress={() =>
          router.push(`/(authenticated)/(buyer)/reserve/${car.id}`)
        }
      >
        <ButtonText>Reservar este auto</ButtonText>
      </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000', marginTop: 8 },
  subtitle: { color: '#aaa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
})