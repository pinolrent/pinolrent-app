import { Linking, Text } from 'react-native'
import { isImageUrl, resolveImageUrl } from '@/utils/errors'
import { AppPressable } from '@/components/ui-kit'

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
    <AppPressable
      accessibilityRole="link"
      accessibilityLabel="Ver comprobante del pago"
      onPress={open}
      className={`min-h-11 justify-center ${className}`}
      hoverClassName="underline"
    >
      <Text
        className="text-sm text-primary"
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        Ver comprobante
      </Text>
    </AppPressable>
  )
}
