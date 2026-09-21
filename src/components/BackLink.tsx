import { Pressable, Text } from 'react-native'
import { router, type Href } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useThemeColors } from '@/hooks/useThemeColors'

export function BackLink({ fallbackHref }: { fallbackHref: Href }) {
  const colors = useThemeColors()

  const onPress = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace(fallbackHref)
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Volver"
      onPress={onPress}
      className="min-h-11 flex-row items-center gap-1 self-start"
      style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
    >
      <ChevronLeft size={20} color={colors.primary} />
      <Text className="text-sm text-primary">Volver</Text>
    </Pressable>
  )
}
