import { Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { SkeletonList } from '@/components/Skeleton'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCar, useCarContact } from '@/hooks/useCars'
import { CarPhoto } from '@/components/rows'
import { formatPrice } from '@/utils/currency'
import { getApiErrorMessage } from '@/utils/errors'
import { useReduceMotion } from '@/components/PressScale'
import { ScreenShell } from '@/components/ScreenShell'
import { AppButton, AppCard, FormError } from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { useBreakpoints } from '@/hooks/useBreakpoints'

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const reduceMotion = useReduceMotion()
  const { isPhone } = useBreakpoints()
  const idNum = Number(id)
  const invalidId = !Number.isFinite(idNum)
  const { data: car, isLoading, isError, error, refetch } = useCar(idNum)
  const contact = useCarContact(idNum)

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar el auto')
    : null

  if (isLoading) {
    return (
      <ScreenShell back title="Detalle del auto">
        <SkeletonList count={2} />
      </ScreenShell>
    )
  }

  if (invalidId || isError || !car) {
    return (
      <ScreenShell back title="Detalle del auto">
        <View className="items-center gap-3 py-8">
          <FormError
            message={errorMessage ?? 'No encontramos ese auto'}
          />
          {!invalidId && (
            <AppButton onPress={() => refetch()}>Reintentar</AppButton>
          )}
        </View>
      </ScreenShell>
    )
  }

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeIn.duration(200)}
      className="flex-1"
    >
      <ScreenShell
        back
        title={car.name}
        subtitle={`${formatPrice(car.price_per_day)} / día`}
        action={
          <StatusBadge tone={car.active ? 'success' : 'muted'}>
            {car.active ? 'Activo' : 'Inactivo'}
          </StatusBadge>
        }
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <View className={isPhone ? 'gap-4' : 'flex-row items-start gap-6'}>
            <View className="flex-1">
              <CarPhoto uri={car.photo_url} name={car.name} />
            </View>
            <View className={isPhone ? 'gap-3' : 'w-80 gap-3'}>
              <AppCard className="gap-3">
                <Text className="text-sm text-muted-foreground">Contacto</Text>
                {contact.data?.whatsapp_url ? (
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel="Contactar al vendedor por WhatsApp"
                    onPress={() =>
                      Linking.openURL(contact.data!.whatsapp_url)
                    }
                    className="min-h-11 justify-center"
                  >
                    <Text className="text-base font-semibold text-primary">
                      Contactar al vendedor por WhatsApp
                    </Text>
                  </Pressable>
                ) : (
                  <Text className="text-base text-foreground">
                    El vendedor todavía no cargó un teléfono.
                  </Text>
                )}
              </AppCard>
              <AppButton
                onPress={() =>
                  router.push(`/(authenticated)/(buyer)/reserve/${car.id}`)
                }
              >
                Reservar este auto
              </AppButton>
            </View>
          </View>
        </ScrollView>
      </ScreenShell>
    </Animated.View>
  )
}
