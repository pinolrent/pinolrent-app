import type { ReactNode } from 'react'
import { Text, View } from 'react-native'

const MAX_WIDTH = {
  default: 1120,
  form: 720,
  wide: 1400,
} as const

export function ScreenShell({
  title,
  subtitle,
  action,
  width = 'default',
  children,
}: {
  title?: string
  subtitle?: string
  action?: ReactNode
  width?: keyof typeof MAX_WIDTH
  children: ReactNode
}) {
  const hasHeader = Boolean(title || action)

  return (
    <View className="flex-1 items-center bg-background">
      <View
        className="w-full flex-1 gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6"
        style={{ maxWidth: MAX_WIDTH[width] }}
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
                <Text className="text-sm text-muted-foreground">{subtitle}</Text>
              ) : null}
            </View>
            {action ? (
              <View className="flex-row items-center gap-2">{action}</View>
            ) : null}
          </View>
        )}
        {children}
      </View>
    </View>
  )
}
