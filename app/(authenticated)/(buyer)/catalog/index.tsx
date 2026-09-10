import { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useCars } from '@/hooks/useCars'
import type { CarsListParams } from '@/types/car'
import type { Car } from '@/types/car'
import { getApiErrorMessage } from '@/utils/errors'
import { StaggerCard } from '@/components/StaggerCard'
import { SkeletonList } from '@/components/Skeleton'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { CarImage } from '@/components/CarImage'
import { formatPrice } from '@/utils/currency'
import { isValidISODate } from '@/utils/dates'
import { AppButton, EmptyState, FormError } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'

const PAGE_SIZE = 10

export default function CatalogScreen() {
  const router = useRouter()
  const { columns: numColumns } = useBreakpoints()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filterError, setFilterError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CarsListParams>({})
  const { data, isLoading, isError, error, refetch, isRefetching, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useCars(PAGE_SIZE, filters)

  const cars = data?.pages.flatMap((page) => page) ?? []

  const applyFilters = () => {
    const start = startDate.trim()
    const end = endDate.trim()
    if ((start && !isValidISODate(start)) || (end && !isValidISODate(end))) {
      setFilterError('Fecha inválida, usa un día real con formato YYYY-MM-DD')
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
      <View className="flex-1 bg-background">
        <SkeletonList count={4} />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background p-6">
        <Text className="text-muted-foreground">{errorMessage}</Text>
        <AppButton onPress={() => refetch()}>Reintentar</AppButton>
      </View>
    )
  }

  const renderItem = ({ item, index }: { item: Car; index: number }) => (
    <StaggerCard index={index}>
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/(authenticated)/(buyer)/car/${item.id}`)}
      className={`overflow-hidden rounded-xl border border-border bg-card ${
        numColumns > 1 ? 'flex-1' : 'flex-row'
      }`}
    >
      <View className={numColumns > 1 ? '' : 'h-24 w-24 shrink-0 items-center justify-center overflow-hidden'}>
        <CarImage uri={item.photo_url} name={item.name} />
      </View>
      <View className="flex-1 justify-center gap-2 p-3">
        <Text numberOfLines={1} className="text-base font-bold text-foreground">{item.name}</Text>
        <Text className="text-sm text-muted-foreground">
          {formatPrice(item.price_per_day)} / día
        </Text>
      </View>
    </Pressable>
    </StaggerCard>
  )

  return (
    <View className="flex-1 bg-background">
      <View className="gap-2 p-4 pb-0">
        <View className="flex-row gap-2">
          <View className="flex-1">
            <AppInput
              label="Desde"
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={10}
              value={startDate}
              onChangeText={setStartDate}
            />
          </View>
          <View className="flex-1">
            <AppInput
              label="Hasta"
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={10}
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>
        </View>
        <FormError message={filterError} />
        <View className="flex-row gap-2">
          <AppButton onPress={applyFilters}>Filtrar</AppButton>
          <AppButton variant="ghost" onPress={clearFilters}>
            Limpiar
          </AppButton>
        </View>
      </View>
      <FlatList
        key={numColumns}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? { gap: 12 } : undefined}
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12 }}
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
          <EmptyState message="No hay autos disponibles" />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </View>
  )
}
