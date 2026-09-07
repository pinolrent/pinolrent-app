import { useState } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'

export function CarImage({ uri, name }: { uri?: string; name: string }) {
  const [failed, setFailed] = useState(false)
  const initial = name ? name[0] : '?'
  if (!uri || failed) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>{initial}</Text>
      </View>
    )
  }
  return (
    <Image
      style={styles.image}
      source={{ uri }}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  )
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 140, borderRadius: 8 },
  placeholder: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    backgroundColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { fontSize: 48, fontWeight: 'bold', color: '#aaa' },
})
