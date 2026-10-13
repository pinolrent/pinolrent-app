import { useState } from 'react'
import { View } from 'react-native'
import { Redirect, Stack } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { AppButton, FormError, LoadingState } from '@/components/ui-kit'

export default function AuthenticatedLayout() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isLoaded = useAuthStore((s) => s.isLoaded)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage)
  const [retrying, setRetrying] = useState(false)

  if (!isLoaded) {
    return <LoadingState />
  }

  if (!token) {
    return <Redirect href="/(auth)/login" />
  }

  if (!user) {
    // Las credenciales se conservan cuando la API no pudo validarlas (sin red
    // o un 5xx): se reintenta sin volver a iniciar sesión.
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background p-6">
        <FormError
          message="No pudimos validar tu sesión, revisa tu conexión"
          className="text-center"
        />
        <AppButton
          loading={retrying}
          onPress={async () => {
            setRetrying(true)
            try {
              await loadFromStorage()
            } finally {
              setRetrying(false)
            }
          }}
        >
          Reintentar
        </AppButton>
        <AppButton variant="outline" onPress={() => clearAuth()}>
          Cerrar sesión
        </AppButton>
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!token && Boolean(user?.roles?.includes('buyer'))}>
        <Stack.Screen name="(buyer)" />
      </Stack.Protected>
      <Stack.Protected guard={!!token && Boolean(user?.roles?.includes('seller'))}>
        <Stack.Screen name="seller" />
      </Stack.Protected>
      <Stack.Protected guard={!!token && Boolean(user?.roles?.includes('admin'))}>
        <Stack.Screen name="admin" />
      </Stack.Protected>
    </Stack>
  )
}
