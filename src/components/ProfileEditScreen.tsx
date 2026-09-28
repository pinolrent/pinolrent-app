import { useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native'
import type { TextInput } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { useAuth, useUpdateProfile } from '@/hooks/useAuth'
import { getApiErrorMessage, validatePhone } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { BackLink } from '@/components/header-back'
import {
  AppButton,
  AppPressable,
  FormError,
  ListGroup,
  SuccessNote,
} from '@/components/ui-kit'
import { AppInput } from '@/components/fields'
import { useThemeColors } from '@/hooks/useThemeColors'

export function ProfileEditScreen() {
  const router = useRouter()
  const colors = useThemeColors()
  const { user } = useAuth()
  const update = useUpdateProfile()
  const phoneRef = useRef<TextInput>(null)
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const serverError = update.isError
    ? getApiErrorMessage(update.error, 'Error al actualizar el teléfono')
    : null

  const initial = (user?.email?.[0] ?? '?').toUpperCase()
  const isSeller = Boolean(user?.roles?.includes('seller'))
  const profileHref = isSeller
    ? '/(authenticated)/seller/profile'
    : '/(authenticated)/(buyer)/profile'
  const passwordHref = isSeller
    ? '/(authenticated)/seller/profile/password'
    : '/(authenticated)/(buyer)/profile/password'

  const onSave = () => {
    const trimmed = phone.trim()
    const error = validatePhone(trimmed, Boolean(user?.roles?.includes('seller')))
    setPhoneError(error)
    if (error) {
      phoneRef.current?.focus()
      return
    }
    setSaved(false)
    update.mutate(trimmed, {
      onSuccess: () => {
        setSaved(true)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      },
      onError: () => {
        setSaved(false)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      },
    })
  }

  return (
    <ScreenShell width="form">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ gap: 16 }}
        >
          <BackLink fallbackHref={profileHref} />
          <View className="items-center gap-3 py-4">
            <View
              accessibilityLabel={`Cuenta de ${user?.email ?? ''}`}
              className="h-24 w-24 items-center justify-center rounded-full bg-primary/10"
            >
              <Text className="text-3xl font-bold text-primary">{initial}</Text>
            </View>
          </View>

          <ListGroup title="Contacto">
            <View className="gap-3 p-4">
              <AppInput
                ref={phoneRef}
                label={
                  user?.roles?.includes('seller')
                    ? 'Teléfono (WhatsApp)'
                    : 'Teléfono (opcional)'
                }
                placeholder="Ej. 9 1234 5678"
                autoComplete="tel"
                textContentType="telephoneNumber"
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={onSave}
                value={phone}
                onChangeText={(v) => {
                  setPhone(v)
                  setPhoneError(null)
                  setSaved(false)
                  update.reset()
                }}
                error={phoneError}
              />
              <FormError message={serverError} />
              <SuccessNote message={saved ? 'Perfil actualizado' : null} />
              <AppButton onPress={onSave} loading={update.isPending}>
                Guardar cambios
              </AppButton>
            </View>
          </ListGroup>

          <ListGroup title="Seguridad">
            <AppPressable
              accessibilityRole="button"
              accessibilityLabel="Cambiar contraseña"
              onPress={() => router.push(passwordHref)}
              hoverClassName="bg-accent"
              className="min-h-14 flex-row items-center justify-between gap-3 px-4 py-3"
            >
              <Text className="text-base text-foreground">
                Cambiar contraseña
              </Text>
              <ChevronRight size={20} color={colors.mutedText} />
            </AppPressable>
          </ListGroup>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  )
}
