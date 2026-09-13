import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useAuthStore } from '@/stores/auth.store'
import { buyerNav, sellerNav } from '@/constants/nav'
import { MenuButton } from '@/components/SideNav'
import { AppBackButton } from '@/components/nav-icons'

const MAX_WIDTH = {
  default: 1120,
  form: 720,
  wide: 1400,
} as const

export function ScreenShell({
  title,
  subtitle,
  action,
  back = false,
  width = 'default',
  children,
}: {
  title?: string
  subtitle?: string
  action?: ReactNode
  back?: boolean
  width?: keyof typeof MAX_WIDTH
  children: ReactNode
}) {
  const { isDesktop } = useBreakpoints()
  const role = useAuthStore((s) => s.user?.role)
  const hasHeader = Boolean(title || action || back)

  return (
    <View className="flex-1 items-center bg-background">
      <View
        className="w-full flex-1 gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6"
        style={{ maxWidth: MAX_WIDTH[width] }}
      >
        {hasHeader && (
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 flex-row items-center gap-3">
              {back && <AppBackButton />}
              <View className="flex-1 gap-1">
                {title ? (
                  <Text
                    accessibilityRole="header"
                    className="text-2xl font-bold text-foreground"
                  >
                    {title}
                  </Text>
                ) : null}
                {subtitle ? (
                  <Text className="text-sm text-muted-foreground">
                    {subtitle}
                  </Text>
                ) : null}
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              {action}
              {!isDesktop && (
                <MenuButton items={role === 'seller' ? sellerNav : buyerNav} />
              )}
            </View>
          </View>
        )}
        {children}
      </View>
    </View>
  )
}
