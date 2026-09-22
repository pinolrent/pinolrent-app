import { useEffect, type ReactNode } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBreakpoints } from '@/hooks/useBreakpoints'

const DISMISS_DISTANCE = 110
const DISMISS_VELOCITY = 800

export function ModalSheet({
  visible,
  onClose,
  title,
  children,
  maxWidth = 480,
}: {
  visible: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: number
}) {
  const { isDesktop } = useBreakpoints()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const translateY = useSharedValue(0)

  useEffect(() => {
    if (visible) translateY.value = 0
  }, [visible, translateY])

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) translateY.value = event.translationY
    })
    .onEnd((event) => {
      if (
        event.translationY > DISMISS_DISTANCE ||
        event.velocityY > DISMISS_VELOCITY
      ) {
        translateY.value = withTiming(height, { duration: 180 }, () => {
          runOnJS(onClose)()
        })
      } else {
        translateY.value = withSpring(0)
      }
    })

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const header = (
    <View className="flex-row items-center justify-between gap-3">
      <Text
        accessibilityRole="header"
        className="flex-1 text-lg font-bold text-foreground"
      >
        {title}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
        onPress={onClose}
        className="min-h-11 justify-center px-2"
        style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
      >
        <Text className="text-sm text-primary">Cerrar</Text>
      </Pressable>
    </View>
  )

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isDesktop ? 'fade' : 'slide'}
      onRequestClose={onClose}
    >
      <View
        className={`flex-1 bg-black/40 ${
          isDesktop ? 'items-center justify-center p-4' : 'justify-end'
        }`}
      >
        <Pressable
          accessibilityLabel="Cerrar"
          onPress={onClose}
          className="absolute inset-0"
        />
        {isDesktop ? (
          <View
            accessibilityViewIsModal
            className="w-full gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
            style={{ maxWidth }}
          >
            {header}
            <ScrollView
              style={{ maxHeight: Math.round(height * 0.7) }}
              contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          </View>
        ) : (
          <GestureDetector gesture={pan}>
            <Animated.View
              accessibilityViewIsModal
              style={sheetStyle}
              className="rounded-t-2xl border border-border bg-card px-4 pt-2"
            >
              <View className="items-center pb-2">
                <View className="h-1 w-10 rounded-full bg-border" />
              </View>
              {header}
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              >
                <ScrollView
                  style={{ maxHeight: Math.round(height * 0.8) }}
                  contentContainerStyle={{
                    gap: 12,
                    paddingTop: 12,
                    paddingBottom: insets.bottom + 16,
                  }}
                  keyboardShouldPersistTaps="handled"
                >
                  {children}
                </ScrollView>
              </KeyboardAvoidingView>
            </Animated.View>
          </GestureDetector>
        )}
      </View>
    </Modal>
  )
}
