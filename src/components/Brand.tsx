import { Image, Text, View } from 'react-native'
import { RouteDashes } from './RouteScene'

const LOGO = require('../assets/icon.png')

export function Brand() {
  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-3">
        <Image
          source={LOGO}
          accessible={false}
          resizeMode="cover"
          style={{ width: 40, height: 40, borderRadius: 8 }}
        />
        <View className="gap-1">
          <Text className="text-2xl font-bold text-foreground">PinolRent</Text>
          <Text className="text-sm text-muted-foreground">
            Alquiler de autos entre personas
          </Text>
        </View>
      </View>
      <RouteDashes />
    </View>
  )
}
