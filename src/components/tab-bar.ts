import { THEME_COLORS, type ThemeName } from '@/constants/theme-colors'

export function tabBarColors(theme: ThemeName) {
  const colors = THEME_COLORS[theme]
  return {
    tabBarStyle: {
      backgroundColor: colors.card,
      borderTopColor: colors.border,
    },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.mutedText,
  }
}
