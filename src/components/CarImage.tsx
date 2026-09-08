import { useState } from 'react'
import { View, Text, Image } from 'react-native'

export function CarImage({ uri, name }: { uri?: string; name: string }) {
  const [failed, setFailed] = useState(false)
  const initial = name ? name[0] : '?'
  if (!uri || failed) {
    return (
      <View className="aspect-[4/3] w-full items-center justify-center rounded-lg bg-muted">
        <Text className="text-5xl font-bold text-muted-foreground">
          {initial}
        </Text>
      </View>
    )
  }
  return (
    <Image
      className="aspect-[4/3] w-full rounded-lg"
      source={{ uri }}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  )
}
