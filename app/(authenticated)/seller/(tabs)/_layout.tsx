import { View } from 'react-native'
import { Tabs } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { useThemeStore } from '@/stores/theme.store'
import { NAV_ICONS } from '@/components/nav-icons'
import { tabBarColors } from '@/components/tab-bar'
import { Sidebar } from '@/components/SideNav'
import { LoadingState } from '@/components/ui-kit'
import { sellerNav } from '@/constants/nav'
import { useBreakpoints } from '@/hooks/useBreakpoints'

function TabIcon({
  Icon,
  color,
}: {
  Icon: (typeof NAV_ICONS)[keyof typeof NAV_ICONS]
  color: string
}) {
  return <Icon size={22} color={color} />
}

export default function SellerTabsLayout() {
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
      <Sidebar items={sellerNav} />
      <View className="flex-1">
        <Tabs
          screenOptions={{
            headerShown: false,
            ...(isDesktop
              ? { tabBarStyle: { display: 'none' } }
              : tabBarColors(theme)),
          }}
        >
          <Tabs.Protected guard={!!token && user?.role === 'seller'}>
            <Tabs.Screen
              name="index"
              options={{
                title: 'Inicio',
                tabBarIcon: ({ color }) => (
                  <TabIcon Icon={NAV_ICONS.home} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="cars/index"
              options={{
                title: 'Mis autos',
                tabBarIcon: ({ color }) => (
                  <TabIcon Icon={NAV_ICONS.cars} color={color} />
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
