import { Tabs } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'

export default function SellerTabsLayout() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Protected guard={!!token && user?.role === 'seller'}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
      </Tabs.Protected>
    </Tabs>
  )
}