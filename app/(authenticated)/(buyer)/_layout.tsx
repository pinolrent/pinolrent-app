import { View, ActivityIndicator } from 'react-native'
import { Tabs } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'

export default function BuyerTabsLayout() {
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
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Protected guard={!!token && user?.role === 'buyer'}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="catalog" options={{ title: 'Catálogo' }} />
        <Tabs.Screen name="car/[id]" options={{ title: 'Detalle', href: null }} />
        <Tabs.Screen name="reservations" options={{ title: 'Reservas' }} />
        <Tabs.Screen name="reserve/[id]" options={{ title: 'Reservar', href: null }} />
      </Tabs.Protected>
    </Tabs>
  )
}