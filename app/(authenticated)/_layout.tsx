import { View, ActivityIndicator } from 'react-native'
import { Stack } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'

export default function AuthenticatedLayout() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isLoaded = useAuthStore((s) => s.isLoaded)

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

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