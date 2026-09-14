import { View, ActivityIndicator } from 'react-native'
import { Stack } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { useThemeStore } from '@/stores/theme.store'
import { headerColors } from '@/components/tab-bar'

export default function BuyerLayout() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isLoaded = useAuthStore((s) => s.isLoaded)
  const theme = useThemeStore((s) => s.theme)

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" accessibilityLabel="Cargando" />
      </View>
    )
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Protected guard={!!token && user?.role === 'buyer'}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="car/[id]"
          options={{ headerShown: true, ...headerColors(theme) }}
        />
        <Stack.Screen
          name="reserve/[id]"
          options={{ headerShown: true, title: 'Reservar', ...headerColors(theme) }}
        />
        <Stack.Screen
          name="reservations/[id]"
          options={{ headerShown: true, title: 'Reserva', ...headerColors(theme) }}
        />
      </Stack.Protected>
    </Stack>
  )
}
