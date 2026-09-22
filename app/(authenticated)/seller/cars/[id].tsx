import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useSellerCars, useToggleSellerCar } from '@/hooks/useSellerCars'
import { CarPhoto } from '@/components/rows'
import { formatPricePerDay } from '@/utils/currency'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import {
  AppButton,
  AppCard,
  ErrorState,
  FormError,
  SuccessNote,
} from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { SkeletonList } from '@/components/Skeleton'
import { useBreakpoints } from '@/hooks/useBreakpoints'

export default function SellerCarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const idNum = Number(id)
  const invalidId = !Number.isFinite(idNum)
  const { isPhone } = useBreakpoints()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useSellerCars()
  const toggleCar = useToggleSellerCar()
  const [notice, setNotice] = useState<string | null>(null)

  const car = data?.find((item) => item.id === idNum)

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar el auto')
    : null

  if (isLoading) {
    return (
      <ScreenShell>
        <Stack.Screen options={{ title: 'Auto' }} />
        <SkeletonList count={1} />
      </ScreenShell>
    )
  }

  if (invalidId || isError || !car) {
    return (
      <ScreenShell>
        <Stack.Screen options={{ title: 'Auto' }} />
        <ErrorState
          message={errorMessage ?? 'No encontramos ese auto'}
          onRetry={invalidId ? undefined : () => refetch()}
          retrying={isRefetching}
        />
      </ScreenShell>
    )
  }

  const onToggle = () => {
    setNotice(null)
    toggleCar.mutate(
      { id: car.id, active: !car.active },
      {
        onSuccess: () => {
          setNotice(car.active ? 'Auto desactivado' : 'Auto activado')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        },
        onError: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        },
      }
    )
  }

  const toggleError = toggleCar.isError
    ? getApiErrorMessage(toggleCar.error, 'Error al actualizar el auto')
    : null

  return (
    <ScreenShell>
      <Stack.Screen options={{ title: car.name }} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        <View className={isPhone ? 'gap-4' : 'flex-row items-start gap-6'}>
          <View className="flex-1">
            <CarPhoto uri={car.photo_url} name={car.name} />
          </View>
          <View className={isPhone ? 'gap-3' : 'w-80 gap-3'}>
            <AppCard gap="sm">
              <Text className="text-base font-bold text-foreground">
                {car.name}
              </Text>
              <Text className="text-sm text-foreground">
                {formatPricePerDay(car.price_per_day)}
              </Text>
              <StatusBadge tone={car.active ? 'success' : 'muted'}>
                {car.active ? 'Activo' : 'Inactivo'}
              </StatusBadge>
            </AppCard>
            <SuccessNote message={notice} />
            <FormError message={toggleError} />
            <AppButton
              variant={car.active ? 'outline' : 'default'}
              onPress={onToggle}
              loading={toggleCar.isPending}
            >
              {car.active ? 'Desactivar' : 'Activar'}
            </AppButton>
          </View>
        </View>
      </ScrollView>
    </ScreenShell>
  )
}
