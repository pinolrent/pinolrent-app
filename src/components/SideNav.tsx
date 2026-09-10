import { useState } from 'react'
import { Image, Modal, Pressable, Text, View } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import { NAV_ICONS } from './nav-icons'
import { useThemeStore } from '@/stores/theme.store'
import { ThemeToggle } from './ThemeToggle'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/utils/errors'

const LOGO = require('../assets/icon.png')

function SidebarFooter() {
  const { logout } = useAuth()
  const logoutError = logout.isError
    ? getApiErrorMessage(logout.error, 'Error al cerrar sesión')
    : null
  return (
    <View className="mt-auto gap-2 border-t border-border pt-3">
      <ThemeToggle />
      {logoutError && (
        <Text className="text-xs text-destructive">{logoutError}</Text>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
        onPress={() => logout.mutate()}
        disabled={logout.isPending}
        className="flex-row items-center justify-center gap-2 rounded-lg bg-destructive px-3 py-2 opacity-100 disabled:opacity-50"
      >
        <Text className="font-semibold text-white">
          {logout.isPending ? 'Cerrando...' : 'Cerrar sesión'}
        </Text>
      </Pressable>
    </View>
  )
}

export interface NavItem {
  label: string
  href: string
  icon: keyof typeof NAV_ICONS
}

function isActive(pathname: string, href: string) {
  const tail = href.split('/').pop() ?? href
  if (!tail || tail.startsWith('(')) return pathname === '/' || pathname === ''
  return pathname === `/${tail}` || pathname.startsWith(`/${tail}/`)
}

export function Sidebar({ items }: { items: NavItem[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isDesktop } = useBreakpoints()

  if (!isDesktop) return null

  return (
    <View className="w-60 gap-1 border-r border-border bg-card p-4">
      <View className="mb-2 flex-row items-center gap-2">
        <Image
          source={LOGO}
          className="h-9 w-9 rounded-lg"
          resizeMode="cover"
        />
        <Text className="text-lg font-bold text-foreground">PinolRent</Text>
      </View>
      {items.map((item) => {
        const Icon = NAV_ICONS[item.icon]
        const active = isActive(pathname, item.href)
        return (
          <Pressable
            key={item.href}
            accessibilityRole="button"
            onPress={() => router.push(item.href as never)}
            className={`flex-row items-center gap-3 rounded-lg px-3 py-2 ${
              active ? 'bg-primary' : ''
            }`}
          >
            <Icon
              size={20}
              color={active ? '#fff' : '#64748B'}
            />
            <Text
              className={
                active
                  ? 'font-semibold text-primary-foreground'
                  : 'text-foreground'
              }
            >
              {item.label}
            </Text>
          </Pressable>
        )
      })}
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

  if (isDesktop) return null

  const MenuIcon = NAV_ICONS.menu
  const CloseIcon = NAV_ICONS.close

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir menú"
        onPress={() => setOpen(true)}
        className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
      >
        <MenuIcon size={20} color={theme === 'dark' ? '#E2E8F0' : '#0F172A'} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade">
        <View className="flex-1">
          <Pressable
            className="absolute inset-0 bg-overlay opacity-70"
            onPress={() => setOpen(false)}
          />
          <View className="mr-auto h-full w-64 gap-1 border-r border-border bg-card p-4">
            <View className="mb-2 flex-row items-center justify-between gap-2">
              <View className="flex-row items-center gap-2">
                <Image
                  source={LOGO}
                  className="h-9 w-9 rounded-lg"
                  resizeMode="cover"
                />
                <Text className="text-lg font-bold text-foreground">
                  PinolRent
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar menú"
                onPress={() => setOpen(false)}
                className="h-10 w-10 items-center justify-center rounded-full border border-border"
              >
                <CloseIcon
                  size={20}
                  color={theme === 'dark' ? '#E2E8F0' : '#0F172A'}
                />
              </Pressable>
            </View>
            {items.map((item) => {
              const Icon = NAV_ICONS[item.icon]
              const active = isActive(pathname, item.href)
              return (
                <Pressable
                  key={item.href}
                  accessibilityRole="button"
                  onPress={() => {
                    setOpen(false)
                    router.push(item.href as never)
                  }}
                  className={`flex-row items-center gap-3 rounded-lg px-3 py-2 ${
                    active ? 'bg-primary' : ''
                  }`}
                >
                  <Icon
                    size={20}
                    color={active ? '#fff' : '#64748B'}
                  />
                  <Text
                    className={
                      active
                        ? 'font-semibold text-primary-foreground'
                        : 'text-foreground'
                    }
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )
            })}
            <SidebarFooter />
          </View>
        </View>
      </Modal>
    </>
  )
}
