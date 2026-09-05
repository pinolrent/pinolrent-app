import { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Button, ButtonText } from '../../../../components/ui/button'
import { useCars } from '@/hooks/useCars'
import { getApiErrorMessage } from '@/utils/errors'
import type { Car } from '@/types/car'
import { formatPrice } from '@/utils/currency'

const PAGE_SIZE = 10

function CarImage({ car }: { car: Car }) {
  const [failed, setFailed] = useState(false)
  if (!car.photo_url || failed) {
    return (
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>{car.name[0]}</Text>
      </View>
    )
  }
  return (
    <Image
      style={styles.image}
      source={{ uri: car.photo_url }}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  )
}

export default function CatalogScreen() {
  const router = useRouter()
  const { data, isLoading, isError, error, refetch, isRefetching, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useCars(PAGE_SIZE)

  const cars = data?.pages.flatMap((page) => page) ?? []

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar el catálogo')
    : null

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.subtitle}>{errorMessage}</Text>
        <Button variant="default" onPress={() => refetch()}>
          <ButtonText>Reintentar</ButtonText>
        </Button>
      </View>
    )
  }

  const renderItem = ({ item }: { item: Car }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/(authenticated)/(buyer)/car/${item.id}`)}
    >
      <CarImage car={item} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardPrice}>{formatPrice(item.price_per_day)}</Text>
      </View>
    </Pressable>
  )

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={cars}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage()
      }}
      onEndReachedThreshold={0.4}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.subtitle}>No hay autos disponibles</Text>
        </View>
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footer}>
            <ActivityIndicator />
          </View>
        ) : null
      }
    />
  )
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  image: { width: 96, height: 96 },
  imagePlaceholder: {
    width: 96,
    height: 96,
    backgroundColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: { fontSize: 32, fontWeight: 'bold', color: '#aaa' },
  cardBody: { flex: 1, justifyContent: 'center', padding: 12, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  cardPrice: { fontSize: 14, color: '#444' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  subtitle: { color: '#aaa', textAlign: 'center' },
  footer: { paddingVertical: 16 },
})