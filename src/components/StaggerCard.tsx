import Animated, { FadeInDown } from 'react-native-reanimated'
import { View } from 'react-native'
import { useReduceMotion } from '@/hooks/useReduceMotion'

export function StaggerCard({
  index,
  children,
}: {
  index: number
  children: React.ReactNode
}) {
  const reduce = useReduceMotion()

  if (reduce) {
    return <View className="flex-1">{children}</View>
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(250).delay(Math.min(index, 10) * 30)}
      className="flex-1"
    >
      {children}
    </Animated.View>
  )
}
