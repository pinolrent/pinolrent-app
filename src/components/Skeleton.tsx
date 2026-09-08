import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { useReduceMotion } from './PressScale'

export function SkeletonCard() {
  const reduce = useReduceMotion()
  const opacity = useSharedValue(0.5)

  useEffect(() => {
    if (!reduce) {
      opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true)
    }
  }, [reduce, opacity])

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <View className="gap-2 rounded-xl border border-border bg-card p-3">
      <Animated.View
        style={style}
        className="aspect-[4/3] w-full rounded-lg bg-muted"
      />
      <View className="h-4 w-2/3 rounded bg-muted" />
      <View className="h-3 w-1/3 rounded bg-muted" />
    </View>
  )
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View className="gap-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  )
}
