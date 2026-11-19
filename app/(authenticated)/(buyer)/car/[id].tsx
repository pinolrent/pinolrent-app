import { useState } from 'react'
import { Linking, ScrollView, Text, View } from 'react-native'
import { SkeletonList } from '@/components/Skeleton'
import Animated from 'react-native-reanimated'
import { useLocalSearchParams, Stack } from 'expo-router'
import { useCar, useCarContact } from '@/hooks/useCars'
import { CarPhoto } from '@/components/rows'
import { formatUSD } from '@/utils/currency'
import { getApiErrorMessage } from '@/utils/errors'
import { useReduceMotion } from '@/hooks/useReduceMotion'
import { enterFade } from '@/constants/motion'
import { ScreenShell } from '@/components/ScreenShell'
import { ReserveCarModal } from '@/components/ReserveCarModal'
import {
  AppButton,
  AppCard,
  AppPressable,
  ErrorState,
  FormError,
} from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { useDetailSplit } from '@/hooks/useDetailSplit'
import { DISPLAY, NUMERIC } from '@/constants/typography'

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [showReserve, setShowReserve] = useState(false)
  const reduceMotion = useReduceMotion()
  const { container, main, side } = useDetailSplit()
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
        <SkeletonList count={1} label="Cargando el auto" />
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

  const reserveButton = (
    <AppButton onPress={() => setShowReserve(true)} disabled={!car.active}>
      Reservar este auto
    </AppButton>
  )

  return (
    <Animated.View entering={enterFade(reduceMotion)} className="flex-1">
      <Stack.Screen options={{ title: car.name }} />
      <ScreenShell topInset={false}>
        <ScrollView className="flex-1">
          <View className={container}>
            <View className={main}>
              <CarPhoto uri={car.photo_url} name={car.name} />
            </View>
            <View className={side}>
              {/* La ficha: nombre, disponibilidad, tarifa y la acción. El
                  botón de reservar va acá y no al final, para que el paso
                  siguiente esté a la vista apenas se lee el precio. */}
              <AppCard gap="sm">
                <View className="flex-row items-start justify-between gap-3">
                  <Text
                    style={DISPLAY}
                    accessibilityRole="header"
                    className="flex-1 text-2xl font-bold text-foreground"
                  >
                    {car.name}
                  </Text>
                  <StatusBadge tone={car.active ? 'success' : 'muted'}>
                    {car.active ? 'Disponible' : 'No disponible'}
                  </StatusBadge>
                </View>
                <View className="flex-row items-baseline gap-2">
                  <Text
                    style={NUMERIC}
                    className="text-3xl font-bold text-foreground"
                  >
                    {formatUSD(car.price_per_day)}
                  </Text>
                  <Text className="text-sm text-muted-foreground">por día</Text>
                </View>
                {car.active ? (
                  <Text className="text-sm text-muted-foreground">
                    El vendedor confirma tu solicitud antes de coordinar la
                    entrega.
                  </Text>
                ) : null}
                {reserveButton}
              </AppCard>
              <AppCard>
                <Text className="text-sm text-muted-foreground">Vendedor</Text>
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
                      Escribirle por WhatsApp
                    </Text>
                  </AppPressable>
                ) : (
                  <Text className="text-base text-foreground">
                    El vendedor todavía no cargó un teléfono.
                  </Text>
                )}
              </AppCard>
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
