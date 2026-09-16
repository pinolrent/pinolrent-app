import { Linking, Pressable, Text } from 'react-native'
import { isImageUrl, resolveImageUrl } from '@/utils/errors'

export function ProofLink({
  url,
  className = '',
}: {
  url?: string
  className?: string
}) {
  if (!url || !isImageUrl(url)) return null

  const open = () => {
    const resolved = resolveImageUrl(url)
    if (resolved) Linking.openURL(resolved)
  }

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel="Ver comprobante del pago"
      onPress={open}
      className={`min-h-11 justify-center ${className}`}
      style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
    >
      <Text
        className="text-sm text-primary"
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        Ver comprobante
      </Text>
    </Pressable>
  )
}
