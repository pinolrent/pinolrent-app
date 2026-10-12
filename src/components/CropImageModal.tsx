import { useState } from 'react'
import { Modal, Platform, Text, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { AppButton, FormError } from '@/components/ui-kit'
import { useReduceMotion } from '@/hooks/useReduceMotion'
import {
  computeCropRect,
  cropOutputSize,
  CropRect,
} from '@/utils/image-crop'

const MIN_SCALE = 1
const MAX_SCALE = 5
const MAX_FRAME_WIDTH = 420

function loadImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('image failed to load'))
    image.src = uri
  })
}

// On web the frame is drawn straight out of the decoded image, so the full
// photo never reaches a canvas: only the cropped region is allocated, and the
// result is encoded once, as jpeg.
async function renderCropOnWeb(
  uri: string,
  rect: CropRect,
  output: { width: number; height: number }
): Promise<string> {
  const image = await loadImage(uri)

  // The picker measures the file with an image of its own: if those numbers
  // ever disagree with the real pixels, trust the pixels.
  const originX = Math.min(rect.originX, Math.max(image.naturalWidth - 1, 0))
  const originY = Math.min(rect.originY, Math.max(image.naturalHeight - 1, 0))
  const sourceWidth = Math.max(
    1,
    Math.min(rect.width, image.naturalWidth - originX)
  )
  const sourceHeight = Math.max(
    1,
    Math.min(rect.height, image.naturalHeight - originY)
  )

  const canvas = document.createElement('canvas')
  canvas.width = output.width
  canvas.height = output.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('canvas is not available')
  context.drawImage(
    image,
    originX,
    originY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    output.width,
    output.height
  )

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.8)
  })
  if (!blob) throw new Error('canvas could not encode the crop')
  return URL.createObjectURL(blob)
}

async function renderCropOnNative(
  uri: string,
  rect: CropRect,
  output: { width: number; height: number }
): Promise<string> {
  const context = ImageManipulator.manipulate(uri)
  context.crop(rect)
  if (output.width < rect.width || output.height < rect.height) {
    context.resize(output)
  }
  const rendered = await context.renderAsync()
  const result = await rendered.saveAsync({
    compress: 0.8,
    format: SaveFormat.JPEG,
  })
  return result.uri
}

function renderCrop(uri: string, rect: CropRect): Promise<string> {
  const output = cropOutputSize(rect)
  if (Platform.OS === 'web') return renderCropOnWeb(uri, rect, output)
  return renderCropOnNative(uri, rect, output)
}

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
  const reduceMotion = useReduceMotion()
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
    const rect = computeCropRect({
      frameWidth,
      frameHeight,
      imageWidth: width,
      imageHeight: height,
      scale: scale.value,
      translateX: translateX.value,
      translateY: translateY.value,
    })
    if (!rect) {
      setError('No pudimos leer esta imagen, prueba con otra')
      return
    }

    setSaving(true)
    try {
      onCropped(await renderCrop(uri, rect))
    } catch (err) {
      if (__DEV__) console.warn('[crop]', err)
      setError('No pudimos recortar la imagen, inténtalo de nuevo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      visible
      animationType={reduceMotion ? 'none' : 'slide'}
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
