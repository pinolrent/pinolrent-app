import { Stack } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'

export default function AuthenticatedLayout() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!token && user?.role === 'buyer'}>
        <Stack.Screen name="(buyer)" />
      </Stack.Protected>
      <Stack.Protected guard={!!token && user?.role === 'seller'}>
        <Stack.Screen name="(seller)" />
      </Stack.Protected>
    </Stack>
  )
}