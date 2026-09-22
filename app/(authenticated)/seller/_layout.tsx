import { Stack } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { useThemeStore } from '@/stores/theme.store'
import { headerColors } from '@/components/tab-bar'
import { LoadingState } from '@/components/ui-kit'

export default function SellerLayout() {
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
      <Stack.Protected guard={!!token && user?.role === 'seller'}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="reservations/[id]"
          options={{
            headerShown: true,
            title: 'Reserva',
            ...headerColors(theme),
          }}
        />
      </Stack.Protected>
    </Stack>
  )
}
