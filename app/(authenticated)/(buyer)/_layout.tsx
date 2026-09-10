import { View, ActivityIndicator } from 'react-native'
import { Tabs } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { useThemeStore } from '@/stores/theme.store'
import { NAV_ICONS } from '@/components/nav-icons'
import { tabBarColors } from '@/components/tab-bar'
import { Sidebar, type NavItem } from '@/components/SideNav'
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

export default function BuyerTabsLayout() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isLoaded = useAuthStore((s) => s.isLoaded)
  const { isDesktop } = useBreakpoints()
  const theme = useThemeStore((s) => s.theme)
  const dark = theme === 'dark'

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  const items: NavItem[] = [{ label: "Inicio", href: "/(authenticated)/(buyer)", icon: "home" }, { label: "Catálogo", href: "/(authenticated)/(buyer)/catalog", icon: "catalog" }, { label: "Reservas", href: "/(authenticated)/(buyer)/reservations", icon: "reservations" }]

  return (
    <View className="flex-1 flex-row bg-background">
      <Sidebar items={items} />
      <View className="flex-1">
        <Tabs
      screenOptions={{
        headerShown: false,
        ...(isDesktop
          ? { tabBarStyle: { display: 'none' } }
          : tabBarColors(dark)),
      }}
    >
      <Tabs.Protected guard={!!token && user?.role === 'buyer'}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color }) => <TabIcon Icon={NAV_ICONS.home} color={color} />,
          }}
        />
        <Tabs.Screen
          name="catalog/index"
          options={{
            title: 'Catálogo',
            tabBarIcon: ({ color }) => <TabIcon Icon={NAV_ICONS.catalog} color={color} />,
          }}
        />
        <Tabs.Screen
          name="car/[id]"
          options={{
            title: 'Detalle',
            href: null,
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
          name="reservations/[id]"
          options={{
            title: 'Detalle',
            href: null,
          }}
        />
        <Tabs.Screen
          name="reserve/[id]"
          options={{
            title: 'Reservar',
            href: null,
          }}
        />
      </Tabs.Protected>
        </Tabs>
      </View>
    </View>
  )
}
