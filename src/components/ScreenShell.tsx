import type { ReactNode } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { SCREEN_WIDTH } from '@/constants/layout'

export function ScreenShell({
  title,
  subtitle,
  action,
  width = 'default',
  topInset = true,
  scroll = false,
  children,
}: {
  title?: string
  subtitle?: string
  action?: ReactNode
  width?: keyof typeof SCREEN_WIDTH
  topInset?: boolean
  scroll?: boolean
  children: ReactNode
}) {
  const { isPhone } = useBreakpoints()
  const insets = useSafeAreaInsets()
  const hasHeader = Boolean(title || action)
  const vertical = isPhone ? 16 : 24

  return (
    <View className="flex-1 items-center bg-background">
      <View
        className={`w-full flex-1 ${isPhone ? 'gap-4 px-4' : 'gap-6 px-6'}`}
        style={{
          maxWidth: SCREEN_WIDTH[width],
          paddingTop: (topInset ? insets.top : 0) + vertical,
          paddingBottom: vertical,
        }}
      >
        {hasHeader && (
          <View className="flex-row items-start justify-between gap-3">
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
            {action ? (
              <View className="flex-row items-center gap-2">{action}</View>
            ) : null}
          </View>
        )}
        {scroll ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, gap: vertical, paddingBottom: 4 }}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </View>
    </View>
  )
}
