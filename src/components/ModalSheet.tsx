import { useEffect, type ReactNode } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { X } from 'lucide-react-native'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useThemeColors } from '@/hooks/useThemeColors'
import { AppPressable } from '@/components/ui-kit'
import { DIALOG_WIDTH } from '@/constants/layout'

const DISMISS_DISTANCE = 110
const DISMISS_VELOCITY = 800
const MODAL_ELEVATION = 12

export function ModalSheet({
  visible,
  onClose,
  title,
  children,
  maxWidth = DIALOG_WIDTH,
  busy = false,
}: {
  visible: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: number
  busy?: boolean
}) {
  const { isDesktop } = useBreakpoints()
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const translateY = useSharedValue(0)

  useEffect(() => {
    if (visible) translateY.value = 0
  }, [visible, translateY])

  const requestClose = () => {
    if (!busy) onClose()
  }

  const pan = Gesture.Pan()
    .enabled(!busy)
    .onUpdate((event) => {
      if (event.translationY > 0) translateY.value = event.translationY
    })
    .onEnd((event) => {
      if (
        event.translationY > DISMISS_DISTANCE ||
        event.velocityY > DISMISS_VELOCITY
      ) {
        translateY.value = withTiming(height, { duration: 180 }, () => {
          runOnJS(requestClose)()
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
      <AppPressable
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
        disabled={busy}
        onPress={requestClose}
        className="min-h-11 min-w-11 items-center justify-center rounded-lg"
        hoverClassName="bg-accent"
      >
        <X size={20} color={busy ? colors.mutedText : colors.text} />
      </AppPressable>
    </View>
  )

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isDesktop ? 'fade' : 'slide'}
      onRequestClose={requestClose}
    >
      <View
        className={`flex-1 bg-overlay/40 ${
          isDesktop ? 'items-center justify-center p-4' : 'justify-end'
        }`}
      >
        <AppPressable
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          onPress={requestClose}
          className="absolute inset-0"
        />
        {isDesktop ? (
          <View
            accessibilityViewIsModal
            className="w-full gap-3 rounded-2xl border border-border bg-card p-4"
            style={{ maxWidth, elevation: MODAL_ELEVATION }}
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
          <Animated.View
            accessibilityViewIsModal
            style={[sheetStyle, { elevation: MODAL_ELEVATION }]}
            className="rounded-t-2xl border border-border bg-card"
          >
            <GestureDetector gesture={pan}>
              <View className="px-4 pt-2">
                <View className="items-center pb-2">
                  <View className="h-1 w-10 rounded-full bg-border" />
                </View>
                {header}
              </View>
            </GestureDetector>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <ScrollView
                style={{ maxHeight: Math.round(height * 0.75) }}
                contentContainerStyle={{
                  gap: 12,
                  paddingHorizontal: 16,
                  paddingTop: 12,
                  paddingBottom: insets.bottom + 16,
                }}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        )}
      </View>
    </Modal>
  )
}
