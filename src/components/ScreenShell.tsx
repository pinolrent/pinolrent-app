import type { ReactNode } from 'react'
import { View, type ViewStyle } from 'react-native'
import { useBreakpoints } from '@/hooks/useBreakpoints'

export function ScreenShell({
  children,
  style,
}: {
  children: ReactNode
  style?: ViewStyle
}) {
  const { contentMaxWidth } = useBreakpoints()
  return (
    <View
      className="w-full flex-1 self-center bg-background px-4 md:px-6"
      style={[{ maxWidth: contentMaxWidth as never }, style]}
    >
      {children}
    </View>
  )
}
