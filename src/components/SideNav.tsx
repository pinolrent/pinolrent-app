import { useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import { NAV_ICONS } from './nav-icons'
import { useThemeStore } from '@/stores/theme.store'
import { ThemeToggle } from './ThemeToggle'
import { useBreakpoints } from '@/hooks/useBreakpoints'

export interface NavItem {
  label: string
  href: string
  icon: keyof typeof NAV_ICONS
}

export function Sidebar({ items }: { items: NavItem[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isDesktop } = useBreakpoints()

  if (!isDesktop) return null

  return (
    <View className="w-60 gap-1 border-l border-border bg-card p-4">
      {items.map((item) => {
        const Icon = NAV_ICONS[item.icon]
        const active = pathname.startsWith(item.href)
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
      <View className="mt-4">
        <ThemeToggle />
      </View>
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
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setOpen(false)}
        >
          <View className="ml-auto h-full w-64 gap-1 bg-card p-4">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar menú"
              onPress={() => setOpen(false)}
              className="mb-2 h-10 w-10 items-center justify-center rounded-full border border-border"
            >
              <CloseIcon
                size={20}
                color={theme === 'dark' ? '#E2E8F0' : '#0F172A'}
              />
            </Pressable>
            {items.map((item) => {
              const Icon = NAV_ICONS[item.icon]
              const active = pathname.startsWith(item.href)
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
            <View className="mt-4">
              <ThemeToggle />
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  )
}
