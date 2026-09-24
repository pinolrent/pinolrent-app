import { useState } from 'react'
import { Linking, ScrollView, Text, View } from 'react-native'
import { SkeletonList } from '@/components/Skeleton'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useLocalSearchParams, Stack } from 'expo-router'
import { useCar, useCarContact } from '@/hooks/useCars'
import { CarPhoto } from '@/components/rows'
import { formatPricePerDay } from '@/utils/currency'
import { getApiErrorMessage } from '@/utils/errors'
import { useReduceMotion } from '@/hooks/useReduceMotion'
import { ScreenShell } from '@/components/ScreenShell'
import { ReserveCarModal } from '@/components/ReserveCarModal'
import {
  AppButton,
  AppCard,
  AppPressable,
  ErrorState,
  FormError,
} from '@/components/ui-kit'
import { useBreakpoints } from '@/hooks/useBreakpoints'

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [showReserve, setShowReserve] = useState(false)
  const reduceMotion = useReduceMotion()
  const { isWide } = useBreakpoints()
  const idNum = Number(id)
  const invalidId = !Number.isFinite(idNum)
  const {
    data: car,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useCar(idNum)
  const contact = useCarContact(idNum)

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar el auto')
    : null

  if (isLoading) {
    return (
      <ScreenShell topInset={false}>
        <Stack.Screen options={{ title: 'Auto' }} />
        <SkeletonList count={1} />
      </ScreenShell>
    )
  }

  if (invalidId || isError || !car) {
    return (
      <ScreenShell topInset={false}>
        <Stack.Screen options={{ title: 'Auto' }} />
        <ErrorState
          message={errorMessage ?? 'No encontramos ese auto'}
          onRetry={invalidId ? undefined : () => refetch()}
          retrying={isRefetching}
          centered
        />
      </ScreenShell>
    )
  }

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeIn.duration(200)}
      className="flex-1"
    >
      <Stack.Screen options={{ title: car.name }} />
      <ScreenShell topInset={false}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <Text className="text-base font-semibold text-foreground">
            {formatPricePerDay(car.price_per_day)}
          </Text>
          <View className={isWide ? 'flex-row items-start gap-6' : 'gap-4'}>
            <View className="flex-1">
              <CarPhoto uri={car.photo_url} name={car.name} />
            </View>
            <View className={isWide ? 'w-80 gap-3' : 'gap-3'}>
              <AppCard>
                <Text className="text-sm text-muted-foreground">Contacto</Text>
                {contact.isError ? (
                  <View className="gap-2">
                    <FormError
                      message={getApiErrorMessage(
                        contact.error,
                        'Error al cargar el contacto'
                      )}
                    />
                    <AppButton
                      variant="outline"
                      size="sm"
                      onPress={() => contact.refetch()}
                      loading={contact.isRefetching}
                    >
                      Reintentar
                    </AppButton>
                  </View>
                ) : contact.isLoading ? (
                  <View className="gap-2">
                    <View className="h-4 w-2/3 rounded bg-muted" />
                    <View className="h-3 w-1/3 rounded bg-muted" />
                  </View>
                ) : contact.data?.whatsapp_url ? (
                  <AppPressable
                    accessibilityRole="link"
                    accessibilityLabel="Contactar al vendedor por WhatsApp"
                    onPress={() => Linking.openURL(contact.data!.whatsapp_url)}
                    className="min-h-11 justify-center"
                  >
                    <Text className="text-base font-semibold text-primary">
                      Contactar al vendedor por WhatsApp
                    </Text>
                  </AppPressable>
                ) : (
                  <Text className="text-base text-foreground">
                    El vendedor todavía no cargó un teléfono.
                  </Text>
                )}
              </AppCard>
              <AppButton
                onPress={() => setShowReserve(true)}
                disabled={!car.active}
              >
                Reservar este auto
              </AppButton>
              {!car.active ? (
                <Text className="text-center text-sm text-muted-foreground">
                  No disponible por ahora
                </Text>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </ScreenShell>
      {showReserve && (
        <ReserveCarModal car={car} onClose={() => setShowReserve(false)} />
      )}
    </Animated.View>
  )
}
