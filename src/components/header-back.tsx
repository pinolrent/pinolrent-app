import { Text } from 'react-native'
import { router, type Href } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { THEME_COLORS, type ThemeName } from '@/constants/theme-colors'
import { AppPressable } from '@/components/ui-kit'
import { useThemeColors } from '@/hooks/useThemeColors'

export function goBack(fallbackHref: Href) {
  if (router.canGoBack()) {
    router.back()
    return
  }
  router.replace(fallbackHref)
}

export function headerBackOptions(theme: ThemeName, fallbackHref: Href) {
  return {
    headerLeft: () => (
      <AppPressable
        accessibilityRole="button"
        accessibilityLabel="Volver"
        hitSlop={8}
        onPress={() => goBack(fallbackHref)}
        className="min-h-11 min-w-11 items-center justify-center"
      >
        <ChevronLeft size={24} color={THEME_COLORS[theme].text} />
      </AppPressable>
    ),
  }
}

export function BackLink({ fallbackHref }: { fallbackHref: Href }) {
  const colors = useThemeColors()

  return (
    <AppPressable
      accessibilityRole="button"
      accessibilityLabel="Volver"
      hitSlop={8}
      onPress={() => goBack(fallbackHref)}
      hoverClassName="underline"
      className="min-h-11 flex-row items-center gap-1 self-start pr-3"
    >
      <ChevronLeft size={24} color={colors.text} />
      <Text className="text-base text-foreground">Volver</Text>
    </AppPressable>
  )
}
