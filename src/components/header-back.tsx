import { Pressable } from 'react-native'
import { router, type Href } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { THEME_COLORS, type ThemeName } from '@/constants/theme-colors'

export function headerBackOptions(theme: ThemeName, fallbackHref: Href) {
  return {
    headerLeft: () => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver"
        hitSlop={8}
        onPress={() => {
          if (router.canGoBack()) {
            router.back()
            return
          }
          router.replace(fallbackHref)
        }}
        className="min-h-11 min-w-11 items-center justify-center"
        style={({ pressed }) => (pressed ? { opacity: 0.6 } : null)}
      >
        <ChevronLeft size={24} color={THEME_COLORS[theme].text} />
      </Pressable>
    ),
  }
}
