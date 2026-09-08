import { useEffect, useState, type ReactNode } from 'react'
import { AccessibilityInfo, Pressable } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

export function useReduceMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {})
  }, [])
  return reduce
}

export function PressScale({
  children,
  onPress,
  label,
}: {
  children: ReactNode
  onPress?: () => void
  label?: string
}) {
  const scale = useSharedValue(1)
  const reduce = useReduceMotion()
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  if (reduce) {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}>
        {children}
      </Pressable>
    )
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { duration: 120 })
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { duration: 120 })
      }}
    >
      <Animated.View style={style}>{children}</Animated.View>
    </Pressable>
  )
}
