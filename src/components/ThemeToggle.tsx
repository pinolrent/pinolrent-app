import { Text } from 'react-native'
import { Moon, Sun } from 'lucide-react-native'
import { useThemeColors } from '@/hooks/useThemeColors'
import { useThemeStore } from '@/stores/theme.store'
import { AppPressable } from '@/components/ui-kit'

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggle)
  const colors = useThemeColors()
  const dark = theme === 'dark'
  // El icono y el texto dicen el modo en el que estás; el botón dice a dónde
  // te lleva. Al revés, estando en oscuro el control se leía "Claro".
  const Icon = dark ? Moon : Sun

  return (
    <AppPressable
      accessibilityRole="button"
      accessibilityLabel={`Tema ${dark ? 'oscuro' : 'claro'}. Cambiar a ${dark ? 'claro' : 'oscuro'}`}
      onPress={() => toggle()}
      className="min-h-11 flex-row items-center gap-2 rounded-full border border-border bg-card px-3 py-2"
    >
      <Icon size={16} color={colors.text} />
      <Text className="text-sm text-foreground">{dark ? 'Oscuro' : 'Claro'}</Text>
    </AppPressable>
  )
}
