import { Redirect, Stack } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { useThemeStore } from '@/stores/theme.store'
import { headerBackOptions } from '@/components/header-back'
import { headerColors } from '@/components/tab-bar'
import { LoadingState } from '@/components/ui-kit'

export default function AuthLayout() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isLoaded = useAuthStore((s) => s.isLoaded)
  const theme = useThemeStore((s) => s.theme)

  if (!isLoaded) {
    return <LoadingState />
  }

  if (token) {
    return (
      <Redirect
        href={
          user?.role === 'seller'
            ? '/(authenticated)/seller'
            : '/(authenticated)/(buyer)'
        }
      />
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="login" />
        <Stack.Screen
          name="register"
          options={{
            headerShown: true,
            title: 'Crear cuenta',
            ...headerBackOptions(theme, '/(auth)/login'),
            ...headerColors(theme),
          }}
        />
      </Stack.Protected>
    </Stack>
  )
}
