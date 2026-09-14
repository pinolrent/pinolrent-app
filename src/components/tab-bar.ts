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

export function headerColors(theme: ThemeName) {
  const colors = THEME_COLORS[theme]
  return {
    headerStyle: { backgroundColor: colors.card },
    headerTintColor: colors.primary,
    headerTitleStyle: { color: colors.text, fontWeight: '600' as const },
  }
}
