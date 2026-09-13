import { Image, Text, View } from 'react-native'

const LOGO = require('../assets/icon.png')

export function Brand() {
  return (
    <View className="flex-row items-center gap-3">
      <Image
        source={LOGO}
        accessible={false}
        resizeMode="cover"
        className="h-10 w-10 rounded-lg"
      />
      <View className="gap-1">
        <Text className="text-2xl font-bold text-foreground">PinolRent</Text>
        <Text className="text-sm text-muted-foreground">
          Alquiler de autos entre personas
        </Text>
      </View>
    </View>
  )
}
