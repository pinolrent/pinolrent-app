import Animated, { FadeInDown } from 'react-native-reanimated'

export function StaggerCard({
  index,
  children,
}: {
  index: number
  children: React.ReactNode
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(250).delay(Math.min(index, 10) * 30)}
      className="flex-1"
    >
      {children}
    </Animated.View>
  )
}
