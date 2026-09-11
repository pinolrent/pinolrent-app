import { useState } from 'react'
import { View, Text, Image } from 'react-native'
import { useBreakpoints, BREAKPOINTS } from '@/hooks/useBreakpoints'
import { resolveImageUrl } from '@/utils/errors'

export function CarImage({ uri, name }: { uri?: string; name: string }) {
  const [failed, setFailed] = useState(false)
  const { width } = useBreakpoints()
  const initial = name ? name[0] : '?'
  const maxWidth =
    width >= BREAKPOINTS.tablet ? BREAKPOINTS.imageMaxWidth : undefined
  const resolved = resolveImageUrl(uri)
  if (!resolved || failed) {
    return (
      <View
        className="aspect-[4/3] w-full items-center justify-center self-center overflow-hidden rounded-lg bg-muted"
        style={maxWidth ? { maxWidth } : undefined}
      >
        <Text className="text-5xl font-bold text-muted-foreground">
          {initial}
        </Text>
      </View>
    )
  }
  return (
    <View
      className="w-full self-center overflow-hidden rounded-lg"
      style={maxWidth ? { maxWidth } : undefined}
    >
      <Image
        className="aspect-[4/3] w-full rounded-lg"
        source={{ uri: resolved }}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
    </View>
  )
}
