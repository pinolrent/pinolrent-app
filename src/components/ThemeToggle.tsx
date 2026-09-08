import { Pressable, Text } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useThemeStore } from '@/stores/theme.store'
import { useReduceMotion } from './PressScale'

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggle)

  const reduce = useReduceMotion()
  const label = theme === 'light' ? '🌙 Oscuro' : '☀️ Claro'
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
      onPress={() => toggle()}
      className="rounded-full border border-border bg-card px-3 py-1.5"
    >
      {reduce ? (
        <Text className="text-sm text-foreground">{label}</Text>
      ) : (
        <Animated.View key={theme} entering={FadeIn.duration(150)}>
          <Text className="text-sm text-foreground">{label}</Text>
        </Animated.View>
      )}
    </Pressable>
  )
}
