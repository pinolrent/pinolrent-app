import { Image, Pressable, Text, View } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import { NAV_ICONS } from './nav-icons'
import type { NavItem } from '@/constants/nav'
import { useHover } from '@/hooks/useHover'
import { useThemeColors } from '@/hooks/useThemeColors'
import { SessionActions } from './SessionActions'
import { useBreakpoints } from '@/hooks/useBreakpoints'

const LOGO = require('../assets/icon.png')

function navPath(href: string) {
  return href
    .split('/')
    .filter(
      (segment) => segment && !(segment.startsWith('(') && segment.endsWith(')'))
    )
    .join('/')
}

function matches(pathname: string, href: string) {
  const path = navPath(href)
  if (!path) return pathname === '/' || pathname === ''
  return pathname === `/${path}` || pathname.startsWith(`/${path}/`)
}

function NavRow({
  item,
  active,
  onPress,
}: {
  item: NavItem
  active: boolean
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const colors = useThemeColors()
  const Icon = NAV_ICONS[item.icon]

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      {...hoverProps}
      className={`min-h-11 flex-row items-center gap-3 rounded-lg px-3 py-2 ${
        active ? 'bg-primary' : hovered ? 'bg-accent' : ''
      }`}
      style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
    >
      <Icon
        size={20}
        color={active ? colors.primaryForeground : colors.mutedText}
      />
      <Text
        className={
          active ? 'font-semibold text-primary-foreground' : 'text-foreground'
        }
      >
        {item.label}
      </Text>
    </Pressable>
  )
}

export function Sidebar({ items }: { items: NavItem[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isDesktop } = useBreakpoints()

  const activeHref = items
    .filter((item) => matches(pathname, item.href))
    .sort((a, b) => navPath(b.href).length - navPath(a.href).length)[0]?.href

  if (!isDesktop) return null

  return (
    <View
      role="navigation"
      accessibilityLabel="Navegación principal"
      className="w-60 gap-1 border-r border-border bg-card p-4"
    >
      <View className="mb-2 flex-row items-center gap-2">
        <Image
          source={LOGO}
          accessible={false}
          className="h-9 w-9 rounded-lg"
          resizeMode="cover"
        />
        <Text className="text-lg font-bold text-foreground">PinolRent</Text>
      </View>
      {items.map((item) => (
        <NavRow
          key={item.href}
          item={item}
          active={activeHref === item.href}
          onPress={() => router.push(item.href as never)}
        />
      ))}
      <View className="mt-auto border-t border-border pt-3">
        <SessionActions />
      </View>
    </View>
  )
}
