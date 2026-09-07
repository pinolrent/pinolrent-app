import { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Button, ButtonText } from '../../../../components/ui/button'
import { useCars } from '@/hooks/useCars'
import type { CarsFilters } from '@/hooks/useCars'
import { getApiErrorMessage } from '@/utils/errors'
import type { Car } from '@/types/car'
import { CarImage } from '@/components/CarImage'
import { formatPrice } from '@/utils/currency'

const PAGE_SIZE = 10

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

export default function CatalogScreen() {
  const router = useRouter()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filterError, setFilterError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CarsFilters>({})
  const { data, isLoading, isError, error, refetch, isRefetching, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useCars(PAGE_SIZE, filters)

  const cars = data?.pages.flatMap((page) => page) ?? []

  const applyFilters = () => {
    const start = startDate.trim()
    const end = endDate.trim()
    if ((start && !ISO_RE.test(start)) || (end && !ISO_RE.test(end))) {
      setFilterError('Formato inválido, esperado YYYY-MM-DD')
      return
    }
    if ((start && !end) || (!start && end)) {
      setFilterError('start_date y end_date deben ir juntos')
      return
    }
    if (start && end && end < start) {
      setFilterError('La fecha de fin debe ser posterior o igual a la de inicio')
      return
    }
    setFilterError(null)
    setFilters(start && end ? { start_date: start, end_date: end } : {})
  }

  const clearFilters = () => {
    setStartDate('')
    setEndDate('')
    setFilterError(null)
    setFilters({})
  }

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
      <View style={styles.imageWrap}>
        <CarImage uri={item.photo_url} name={item.name} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardPrice}>{formatPrice(item.price_per_day)}</Text>
      </View>
    </Pressable>
  )

  return (
    <View style={styles.container}>
      <View style={styles.filterBox}>
        <TextInput
          style={styles.filterInput}
          placeholder="Desde (YYYY-MM-DD)"
          placeholderTextColor="#888"
          autoCapitalize="none"
          autoCorrect={false}
          value={startDate}
          onChangeText={setStartDate}
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Hasta (YYYY-MM-DD)"
          placeholderTextColor="#888"
          autoCapitalize="none"
          autoCorrect={false}
          value={endDate}
          onChangeText={setEndDate}
        />
        {filterError && <Text style={styles.error}>{filterError}</Text>}
        <View style={styles.filterActions}>
          <Button variant="default" onPress={applyFilters}>
            <ButtonText>Filtrar</ButtonText>
          </Button>
          <Button variant="ghost" onPress={clearFilters}>
            <ButtonText>Limpiar</ButtonText>
          </Button>
        </View>
      </View>
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterBox: { padding: 16, paddingBottom: 0, gap: 8 },
  filterInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
  },
  filterActions: { flexDirection: 'row', gap: 8 },
  error: { color: '#ff6467' },
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
  imageWrap: { width: 96, height: 96 },
  cardBody: { flex: 1, justifyContent: 'center', padding: 12, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  cardPrice: { fontSize: 14, color: '#444' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  subtitle: { color: '#aaa', textAlign: 'center' },
  footer: { paddingVertical: 16 },
})