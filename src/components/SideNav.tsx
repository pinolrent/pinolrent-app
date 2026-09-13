import { useEffect, useRef, useState } from 'react'
import { Image, Modal, Pressable, Text, View } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import { NAV_ICONS } from './nav-icons'
import type { NavItem } from '@/constants/nav'
import { THEME_COLORS } from '@/constants/theme-colors'
import { useHover } from '@/hooks/useHover'
import { useThemeStore } from '@/stores/theme.store'
import { ThemeToggle } from './ThemeToggle'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/utils/errors'

const LOGO = require('../assets/icon.png')

function focusNode(node: unknown) {
  const focus = (node as { focus?: unknown } | null)?.focus
  if (typeof focus === 'function') {
    focus.call(node)
  }
}

function SidebarFooter() {
  const { logout } = useAuth()
  const logoutError = logout.isError
    ? getApiErrorMessage(logout.error, 'Error al cerrar sesión')
    : null
  return (
    <View className="mt-auto gap-2 border-t border-border pt-3">
      <ThemeToggle />
      {logoutError && (
        <Text
          accessibilityRole="alert"
          className="text-xs text-destructive"
        >
          {logoutError}
        </Text>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
        onPress={() => logout.mutate()}
        disabled={logout.isPending}
        className={`min-h-11 flex-row items-center justify-center gap-2 rounded-lg bg-destructive px-3 py-2 ${
          logout.isPending ? 'opacity-40' : ''
        }`}
      >
        <Text className="font-semibold text-white">
          {logout.isPending ? 'Cerrando sesión' : 'Cerrar sesión'}
        </Text>
      </Pressable>
    </View>
  )
}

function isActive(pathname: string, href: string) {
  const tail = href.split('/').pop() ?? href
  if (!tail || tail.startsWith('(')) return pathname === '/' || pathname === ''
  return pathname === `/${tail}` || pathname.startsWith(`/${tail}/`)
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
  const theme = useThemeStore((s) => s.theme)
  const Icon = NAV_ICONS[item.icon]

  return (
    <Pressable
      accessibilityRole="button"
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
        color={
          active
            ? THEME_COLORS[theme].primaryForeground
            : THEME_COLORS[theme].mutedText
        }
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
          active={isActive(pathname, item.href)}
          onPress={() => router.push(item.href as never)}
        />
      ))}
      <SidebarFooter />
    </View>
  )
}

export function MenuButton({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const theme = useThemeStore((s) => s.theme)
  const { isDesktop } = useBreakpoints()
  const menuRef = useRef<React.ComponentRef<typeof Pressable>>(null)
  const closeRef = useRef<React.ComponentRef<typeof Pressable>>(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (open) {
      focusNode(closeRef.current)
    } else if (wasOpen.current) {
      focusNode(menuRef.current)
    }
    wasOpen.current = open
  }, [open])

  if (isDesktop) return null

  const MenuIcon = NAV_ICONS.menu
  const CloseIcon = NAV_ICONS.close

  return (
    <>
      <Pressable
        ref={menuRef}
        accessibilityRole="button"
        accessibilityLabel="Abrir menú"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        className="h-11 w-11 items-center justify-center rounded-full border border-border bg-card"
      >
        <MenuIcon size={20} color={THEME_COLORS[theme].text} />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View className="flex-1">
          <Pressable
            accessible={false}
            className="absolute inset-0 bg-overlay opacity-70"
            onPress={() => setOpen(false)}
          />
          <View
            role="dialog"
            accessibilityLabel="Menú"
            accessibilityViewIsModal
            className="mr-auto h-full w-64 gap-1 border-r border-border bg-card p-4"
          >
            <View className="mb-2 flex-row items-center justify-between gap-2">
              <View className="flex-row items-center gap-2">
                <Image
                  source={LOGO}
                  accessible={false}
                  className="h-9 w-9 rounded-lg"
                  resizeMode="cover"
                />
                <Text className="text-lg font-bold text-foreground">
                  PinolRent
                </Text>
              </View>
              <Pressable
                ref={closeRef}
                accessibilityRole="button"
                accessibilityLabel="Cerrar menú"
                onPress={() => setOpen(false)}
                className="h-11 w-11 items-center justify-center rounded-full border border-border"
              >
                <CloseIcon size={20} color={THEME_COLORS[theme].text} />
              </Pressable>
            </View>
            {items.map((item) => (
              <NavRow
                key={item.href}
                item={item}
                active={isActive(pathname, item.href)}
                onPress={() => {
                  setOpen(false)
                  router.push(item.href as never)
                }}
              />
            ))}
            <SidebarFooter />
          </View>
        </View>
      </Modal>
    </>
  )
}
