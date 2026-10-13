import { View } from 'react-native'
import { Tabs } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { useThemeStore } from '@/stores/theme.store'
import { NAV_ICONS } from '@/components/nav-icons'
import { TabIcon } from '@/components/TabIcon'
import { tabBarColors } from '@/components/tab-bar'
import { Sidebar } from '@/components/SideNav'
import { LoadingState } from '@/components/ui-kit'
import { adminNav } from '@/constants/nav'
import { useBreakpoints } from '@/hooks/useBreakpoints'

export default function AdminTabsLayout() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isLoaded = useAuthStore((s) => s.isLoaded)
  const { isDesktop } = useBreakpoints()
  const theme = useThemeStore((s) => s.theme)

  if (!isLoaded) {
    return <LoadingState />
  }

  return (
    <View className="flex-1 flex-row bg-background">
      <Sidebar items={adminNav} />
      <View className="flex-1">
        <Tabs
          screenOptions={{
            headerShown: false,
            ...(isDesktop
              ? { tabBarStyle: { display: 'none' } }
              : tabBarColors(theme)),
          }}
        >
          <Tabs.Protected
            guard={!!token && Boolean(user?.roles?.includes('admin'))}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: 'Panel',
                tabBarIcon: ({ color }) => (
                  <TabIcon Icon={NAV_ICONS.panel} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="reservations/index"
              options={{
                title: 'Reservas',
                tabBarIcon: ({ color }) => (
                  <TabIcon Icon={NAV_ICONS.reservations} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="users/index"
              options={{
                title: 'Usuarios',
                tabBarIcon: ({ color }) => (
                  <TabIcon Icon={NAV_ICONS.users} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="cars/index"
              options={{
                title: 'Autos',
                tabBarIcon: ({ color }) => (
                  <TabIcon Icon={NAV_ICONS.cars} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="payments/index"
              options={{
                title: 'Pagos',
                tabBarIcon: ({ color }) => (
                  <TabIcon Icon={NAV_ICONS.payments} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: 'Perfil',
                tabBarIcon: ({ color }) => (
                  <TabIcon Icon={NAV_ICONS.profile} color={color} />
                ),
              }}
            />
          </Tabs.Protected>
        </Tabs>
      </View>
    </View>
  )
}
