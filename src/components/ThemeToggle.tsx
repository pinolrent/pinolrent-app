import { Pressable, Text, View } from 'react-native'
import { Moon, Sun } from 'lucide-react-native'
import { useThemeStore } from '@/stores/theme.store'

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggle)
  const dark = theme === 'dark'
  const Icon = dark ? Sun : Moon

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
      onPress={() => toggle()}
      className="flex-row items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5"
    >
      <Icon size={16} color={dark ? '#E2E8F0' : '#0F172A'} />
      <View>
        <Text className="text-sm text-foreground">
          {dark ? 'Claro' : 'Oscuro'}
        </Text>
      </View>
    </Pressable>
  )
}
