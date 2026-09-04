import { Stack } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'

export default function AuthLayout() {
  const token = useAuthStore((s) => s.token)

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  )
}
