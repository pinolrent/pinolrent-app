import { Stack } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { useThemeStore } from '@/stores/theme.store'
import { headerBackOptions } from '@/components/header-back'
import { headerColors } from '@/components/tab-bar'
import { LoadingState } from '@/components/ui-kit'

export default function BuyerLayout() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isLoaded = useAuthStore((s) => s.isLoaded)
  const theme = useThemeStore((s) => s.theme)

  if (!isLoaded) {
    return <LoadingState />
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
          options={{
            headerShown: true,
            ...headerBackOptions(theme, '/(authenticated)/(buyer)/catalog'),
            ...headerColors(theme),
          }}
        />
        <Stack.Screen
          name="reservations/[id]"
          options={{
            headerShown: true,
            title: 'Reserva',
            ...headerBackOptions(
              theme,
              '/(authenticated)/(buyer)/reservations'
            ),
            ...headerColors(theme),
          }}
        />
      </Stack.Protected>
    </Stack>
  )
}
