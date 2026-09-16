import { Redirect, Stack } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { LoadingState } from '@/components/ui-kit'

export default function AuthLayout() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isLoaded = useAuthStore((s) => s.isLoaded)

  if (!isLoaded) {
    return <LoadingState />
  }

  if (token) {
    return (
      <Redirect
        href={
          user?.role === 'seller'
            ? '/(authenticated)/(seller)'
            : '/(authenticated)/(buyer)'
        }
      />
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  )
}
