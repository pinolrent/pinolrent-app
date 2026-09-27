import Animated from 'react-native-reanimated'
import { View } from 'react-native'
import { enterCard } from '@/constants/motion'
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
      entering={enterCard(reduce, index)}
      className={`flex-1 ${className}`}
    >
      {children}
    </Animated.View>
  )
}
