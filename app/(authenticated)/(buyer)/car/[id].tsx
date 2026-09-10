import { View, Text, ScrollView } from 'react-native'
import { SkeletonList } from '@/components/Skeleton'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCar } from '@/hooks/useCars'
import { CarImage } from '@/components/CarImage'
import { formatPrice } from '@/utils/currency'
import { getApiErrorMessage } from '@/utils/errors'
import { AppBackButton } from '@/components/nav-icons'
import { AppButton } from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'

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
      <View className="flex-1 bg-background">
        <SkeletonList count={2} />
      </View>
    )
  }

  if (invalidId || isError || !car) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background p-4">
        <Text className="text-muted-foreground">
          {invalidId
            ? 'ID de auto inválido'
            : (errorMessage ?? 'No se encontró el auto')}
        </Text>
        {!invalidId && (
          <AppButton onPress={() => refetch()}>Reintentar</AppButton>
        )}
      </View>
    )
  }

  return (
    <Animated.View entering={FadeIn.duration(200)} className="flex-1 bg-background">
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, gap: 12 }}
    >
        <AppBackButton />
      <CarImage uri={car.photo_url} name={car.name} />
      <View className="flex-row items-center justify-between gap-2">
        <Text className="mt-2 flex-1 text-2xl font-bold text-foreground">
          {car.name}
        </Text>
        <StatusBadge tone={car.active ? 'success' : 'muted'}>
          {car.active ? 'Activo' : 'Inactivo'}
        </StatusBadge>
      </View>
      <Text className="text-muted-foreground">
        {formatPrice(car.price_per_day)} / día
      </Text>
      <AppButton
        onPress={() => router.push(`/(authenticated)/(buyer)/reserve/${car.id}`)}
      >
        Reservar este auto
      </AppButton>
    </ScrollView>
    </Animated.View>
  )
}

