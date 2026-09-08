import { Pressable, Text } from 'react-native'
import { useThemeStore } from '@/stores/theme.store'

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggle)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
      onPress={() => toggle()}
      className="rounded-full border border-border bg-card px-3 py-1.5"
    >
      <Text className="text-sm text-foreground">
        {theme === 'light' ? '🌙 Oscuro' : '☀️ Claro'}
      </Text>
    </Pressable>
  )
}
