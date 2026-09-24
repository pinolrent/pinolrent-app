import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { useReduceMotion } from '@/hooks/useReduceMotion'

function usePulse() {
  const reduce = useReduceMotion()
  const opacity = useSharedValue(0.5)

  useEffect(() => {
    if (!reduce) {
      opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true)
    }
  }, [reduce, opacity])

  return useAnimatedStyle(() => ({ opacity: opacity.value }))
}

export function SkeletonCard() {
  const style = usePulse()

  return (
    <View
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      className="gap-2 rounded-xl border border-border bg-card p-3"
    >
      <Animated.View
        style={style}
        className="aspect-[3/2] w-full rounded-lg bg-muted"
      />
      <View className="h-4 w-2/3 rounded bg-muted" />
      <View className="h-3 w-1/3 rounded bg-muted" />
    </View>
  )
}

export function SkeletonRow() {
  const style = usePulse()

  return (
    <View
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      className="min-h-20 flex-row items-center gap-3 border-border bg-card px-4 py-3"
    >
      <Animated.View style={style} className="h-16 w-16 rounded-lg bg-muted" />
      <View className="flex-1 gap-2">
        <View className="h-4 w-1/2 rounded bg-muted" />
        <View className="h-3 w-1/3 rounded bg-muted" />
      </View>
    </View>
  )
}

export function SkeletonCardRow() {
  const style = usePulse()

  return (
    <View
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      className="gap-3 rounded-xl border border-border bg-card p-3 shadow-xs"
    >
      <View className="flex-row items-center gap-3">
        <Animated.View
          style={style}
          className="h-16 w-16 rounded-lg bg-muted"
        />
        <View className="flex-1 gap-2">
          <View className="h-4 w-1/2 rounded bg-muted" />
          <View className="h-3 w-1/3 rounded bg-muted" />
        </View>
      </View>
      <View className="h-3 w-2/3 rounded bg-muted" />
    </View>
  )
}

export function SkeletonList({
  count = 4,
  variant = 'card',
}: {
  count?: number
  variant?: 'card' | 'row' | 'cardRow'
}) {
  return (
    <View
      accessible
      accessibilityLabel="Cargando"
      accessibilityLiveRegion="polite"
      className="gap-3 p-4"
    >
      {Array.from({ length: count }).map((_, i) => {
        if (variant === 'row') return <SkeletonRow key={i} />
        if (variant === 'cardRow') return <SkeletonCardRow key={i} />
        return <SkeletonCard key={i} />
      })}
    </View>
  )
}
