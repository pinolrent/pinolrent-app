import Animated from 'react-native-reanimated'
import { View } from 'react-native'
import { enterCard } from '@/constants/motion'
import { useReduceMotion } from '@/hooks/useReduceMotion'

export function StaggerCard({
  index,
  className = '',
  // En una grilla de varias columnas la tarjeta se reparte el ancho; apilada en
  // una sola columna el `flex-1` (base 0) la metía en la misma fila que sus
  // vecinas y las tres quedaban de 109px: ahí el ancho lo pone el que la usa.
  flex = true,
  children,
}: {
  index: number
  className?: string
  flex?: boolean
  children: React.ReactNode
}) {
  const reduce = useReduceMotion()
  const classes = flex ? `flex-1 ${className}` : className

  if (reduce) {
    return <View className={classes}>{children}</View>
  }

  return (
    <Animated.View entering={enterCard(reduce, index)} className={classes}>
      {children}
    </Animated.View>
  )
}
