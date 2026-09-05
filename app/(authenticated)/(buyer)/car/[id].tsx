import { useState } from 'react'
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Button, ButtonText } from '../../../../components/ui/button'
import { useCar } from '@/hooks/useCars'
import { formatPrice } from '@/utils/currency'

function DetailImage({ uri, name }: { uri?: string; name: string }) {
  const [failed, setFailed] = useState(false)
  if (!uri || failed) {
    return (
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>{name[0]}</Text>
      </View>
    )
  }
  return (
    <Image
      style={styles.image}
      source={{ uri }}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  )
}

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: car, isLoading, isError, error, refetch } = useCar(Number(id))

  const errorMessage = isError
    ? (error as any)?.response?.data?.error ||
      error?.message ||
      'Error al cargar el auto'
    : null

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (isError || !car) {
    return (
      <View style={styles.center}>
        <Text style={styles.subtitle}>
          {errorMessage ?? 'No se encontró el auto'}
        </Text>
        <Button variant="default" onPress={() => refetch()}>
          <ButtonText>Reintentar</ButtonText>
        </Button>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <DetailImage uri={car.photo_url} name={car.name} />
      <Text style={styles.title}>{car.name}</Text>
      <Text style={styles.subtitle}>Precio por día: {formatPrice(car.price_per_day)}</Text>
      <Text style={styles.subtitle}>Vendedor ID: {car.owner_id}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  image: { width: '100%', height: 200, borderRadius: 12 },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: { fontSize: 64, fontWeight: 'bold', color: '#aaa' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000', marginTop: 8 },
  subtitle: { color: '#aaa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
})