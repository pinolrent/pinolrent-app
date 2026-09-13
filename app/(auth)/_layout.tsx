import { View, ActivityIndicator } from 'react-native'
import { Stack } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'

export default function AuthLayout() {
  const token = useAuthStore((s) => s.token)
  const isLoaded = useAuthStore((s) => s.isLoaded)

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" accessibilityLabel="Cargando" />
      </View>
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
