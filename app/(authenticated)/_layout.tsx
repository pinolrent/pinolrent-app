import { useEffect } from 'react'
import { Text, View } from 'react-native'
import { Stack } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { AppButton, LoadingState } from '@/components/ui-kit'

export default function AuthenticatedLayout() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isLoaded = useAuthStore((s) => s.isLoaded)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  useEffect(() => {
    if (isLoaded && token && !user) {
      clearAuth()
    }
  }, [isLoaded, token, user, clearAuth])

  if (!isLoaded) {
    return <LoadingState />
  }

  if (token && !user) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background p-6">
        <Text accessibilityRole="alert" className="text-center text-foreground">
          Sesión inválida, vuelve a iniciar sesión
        </Text>
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