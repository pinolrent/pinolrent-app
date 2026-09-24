import Animated, { FadeInDown } from 'react-native-reanimated'
import { View } from 'react-native'
import { useReduceMotion } from '@/hooks/useReduceMotion'

export function StaggerCard({
  index,
  className = '',
  children,
}: {
  index: number
  className?: string
  children: React.ReactNode
}) {
  const reduce = useReduceMotion()

  if (reduce) {
    return <View className={`flex-1 ${className}`}>{children}</View>
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(250).delay(Math.min(index, 10) * 30)}
      className={`flex-1 ${className}`}
    >
      {children}
    </Animated.View>
  )
}
