import { useEffect } from 'react'
import { Text, View, ActivityIndicator } from 'react-native'
import { Stack } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { AppButton } from '@/components/ui-kit'

export default function AuthenticatedLayout() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isLoaded = useAuthStore((s) => s.isLoaded)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  useEffect(() => {
    if (isLoaded && token && !user) {
      clearAuth()
    }
  }, [isLoaded, token, user])

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (token && !user) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          padding: 24,
        }}
      >
        <Text>Sesión inválida, vuelve a iniciar sesión</Text>
        <AppButton onPress={() => clearAuth()}>Cerrar sesión</AppButton>
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