import { View, ActivityIndicator } from 'react-native'
import { Tabs } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { useThemeStore } from '@/stores/theme.store'
import { NAV_ICONS } from '@/components/nav-icons'

function tabIcon(
  Icon: (typeof NAV_ICONS)[keyof typeof NAV_ICONS],
  color: string
) {
  return () => <Icon size={22} color={color} />
}

export default function SellerTabsLayout() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isLoaded = useAuthStore((s) => s.isLoaded)
  const theme = useThemeStore((s) => s.theme)
  const dark = theme === 'dark'

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: dark ? '#111C33' : '#FFFFFF',
          borderTopColor: dark ? '#243352' : '#E2E8F0',
        },
        tabBarActiveTintColor: dark ? '#60A5FA' : '#1D4ED8',
        tabBarInactiveTintColor: dark ? '#94A3B8' : '#64748B',
      }}
    >
      <Tabs.Protected guard={!!token && user?.role === 'seller'}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color }) => tabIcon(NAV_ICONS.home, color)(),
          }}
        />
        <Tabs.Screen
          name="cars"
          options={{
            title: 'Mis autos',
            tabBarIcon: ({ color }) => tabIcon(NAV_ICONS.cars, color)(),
          }}
        />
        <Tabs.Screen
          name="reservations"
          options={{
            title: 'Reservas',
            tabBarIcon: ({ color }) =>
              tabIcon(NAV_ICONS.reservations, color)(),
          }}
        />
      </Tabs.Protected>
    </Tabs>
  )
}
