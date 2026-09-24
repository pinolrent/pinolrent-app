import { useState } from 'react'
import { Modal, Text, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { AppButton, FormError } from '@/components/ui-kit'

const MIN_SCALE = 1
const MAX_SCALE = 5
const MAX_FRAME_WIDTH = 420

export function CropImageModal({
  uri,
  width,
  height,
  aspect,
  onCancel,
  onCropped,
}: {
  uri: string
  width: number
  height: number
  aspect: number
  onCancel: () => void
  onCropped: (croppedUri: string) => void
}) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // El marco también respeta la altura: calculado solo desde el ancho, en un
  // viewport bajo (o con el texto ampliado) empuja la fila de zoom y el pie
  // fuera de la pantalla.
  const maxFrameWidth = Math.min(screenWidth - 32, MAX_FRAME_WIDTH)
  const maxFrameHeight = Math.max(160, screenHeight * 0.42)
  const frameWidth = Math.round(Math.min(maxFrameWidth, maxFrameHeight * aspect))
  const frameHeight = Math.round(frameWidth / aspect)
  const baseScale = Math.max(frameWidth / width, frameHeight / height)
  const displayWidth = width * baseScale
  const displayHeight = height * baseScale

  const scale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const startScale = useSharedValue(1)

  const clampTranslation = (nextScale: number) => {
    const boundX = Math.max(0, (displayWidth * nextScale - frameWidth) / 2)
    const boundY = Math.max(0, (displayHeight * nextScale - frameHeight) / 2)
    translateX.value = Math.min(Math.max(translateX.value, -boundX), boundX)
    translateY.value = Math.min(Math.max(translateY.value, -boundY), boundY)
  }

  const pan = Gesture.Pan().onChange((event) => {
    const boundX = Math.max(0, (displayWidth * scale.value - frameWidth) / 2)
    const boundY = Math.max(0, (displayHeight * scale.value - frameHeight) / 2)
    translateX.value = Math.min(
      Math.max(translateX.value + event.changeX, -boundX),
      boundX
    )
    translateY.value = Math.min(
      Math.max(translateY.value + event.changeY, -boundY),
      boundY
    )
  })

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value
    })
    .onUpdate((event) => {
      const next = Math.min(
        Math.max(startScale.value * event.scale, MIN_SCALE),
        MAX_SCALE
      )
      scale.value = next
      const boundX = Math.max(0, (displayWidth * next - frameWidth) / 2)
      const boundY = Math.max(0, (displayHeight * next - frameHeight) / 2)
      translateX.value = Math.min(Math.max(translateX.value, -boundX), boundX)
      translateY.value = Math.min(Math.max(translateY.value, -boundY), boundY)
    })

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }))

  const zoom = (delta: number) => {
    scale.value = Math.min(Math.max(scale.value + delta, MIN_SCALE), MAX_SCALE)
    clampTranslation(scale.value)
  }

  const save = async () => {
    setError(null)
    setSaving(true)
    try {
      const effectiveScale = baseScale * scale.value
      const originX = Math.round(
        (-frameWidth / 2 - translateX.value) / effectiveScale + width / 2
      )
      const originY = Math.round(
        (-frameHeight / 2 - translateY.value) / effectiveScale + height / 2
      )
      const cropWidth = Math.round(frameWidth / effectiveScale)
      const cropHeight = Math.round(frameHeight / effectiveScale)
      const clampedX = Math.min(Math.max(originX, 0), width - cropWidth)
      const clampedY = Math.min(Math.max(originY, 0), height - cropHeight)

      const context = ImageManipulator.manipulate(uri)
      context.crop({
        originX: clampedX,
        originY: clampedY,
        width: cropWidth,
        height: cropHeight,
      })
      const rendered = await context.renderAsync()
      const result = await rendered.saveAsync({
        compress: 0.8,
        format: SaveFormat.JPEG,
      })
      onCropped(result.uri)
    } catch {
      setError('No pudimos recortar la imagen, inténtalo de nuevo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      visible
      animationType="slide"
      onRequestClose={onCancel}
      presentationStyle="fullScreen"
    >
      <View className="flex-1 bg-background">
        <View
          className="flex-row items-center justify-between gap-3 border-b border-border px-4 py-2"
          style={{ paddingTop: insets.top + 8 }}
        >
          <Text
            accessibilityRole="header"
            className="text-lg font-bold text-foreground"
          >
            Recortar foto
          </Text>
        </View>
        <View className="flex-1 items-center justify-center gap-4 px-4">
          <GestureDetector gesture={Gesture.Simultaneous(pan, pinch)}>
            <View
              accessibilityLabel="Área de recorte"
              style={{ width: frameWidth, height: frameHeight }}
              className="overflow-hidden rounded-xl border border-border bg-black"
            >
              <Animated.Image
                source={{ uri }}
                accessible={false}
                style={[
                  {
                    position: 'absolute',
                    left: (frameWidth - displayWidth) / 2,
                    top: (frameHeight - displayHeight) / 2,
                    width: displayWidth,
                    height: displayHeight,
                  },
                  imageStyle,
                ]}
              />
            </View>
          </GestureDetector>
          <Text className="text-center text-sm text-muted-foreground">
            Arrastra y pellizca para ajustar el encuadre
          </Text>
          <View className="flex-row items-center gap-2">
            <AppButton
              variant="outline"
              size="sm"
              accessibilityLabel="Alejar"
              onPress={() => zoom(-0.25)}
            >
              −
            </AppButton>
            <AppButton
              variant="outline"
              size="sm"
              accessibilityLabel="Acercar"
              onPress={() => zoom(0.25)}
            >
              +
            </AppButton>
          </View>
          <FormError message={error} />
        </View>
        <View className="flex-row items-center justify-end gap-2 border-t border-border px-4 py-3">
          <AppButton variant="ghost" onPress={onCancel}>
            Cancelar
          </AppButton>
          <AppButton onPress={save} loading={saving}>
            Guardar recorte
          </AppButton>
        </View>
      </View>
    </Modal>
  )
}
