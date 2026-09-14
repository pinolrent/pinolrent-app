import { THEME_COLORS } from '@/constants/theme-colors'
import { useThemeStore } from '@/stores/theme.store'

export function useThemeColors() {
  const theme = useThemeStore((s) => s.theme)
  return THEME_COLORS[theme]
}
