import { useRef, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import type { TextInput } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useAuth, useUpdateProfile } from '@/hooks/useAuth'
import { getApiErrorMessage, validatePhone } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import {
  AppButton,
  FormError,
  ListGroup,
  ListRow,
  SuccessNote,
} from '@/components/ui-kit'
import { AppInput } from '@/components/fields'

export function ProfileEditScreen() {
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

  const onSave = () => {
    const trimmed = phone.trim()
    const error = validatePhone(trimmed, user?.role === 'seller')
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
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 16, paddingBottom: 16 }}
      >
        <View className="items-center gap-3 py-4">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Text className="text-3xl font-bold text-primary">{initial}</Text>
          </View>
          <Text className="text-sm text-muted-foreground">
            {user?.role === 'seller' ? 'Vendedor' : 'Comprador'}
          </Text>
        </View>

        <ListGroup title="Cuenta">
          <ListRow>
            <Text className="text-sm text-muted-foreground">Email</Text>
            <Text
              numberOfLines={1}
              className="flex-1 text-right text-base text-foreground"
            >
              {user?.email}
            </Text>
          </ListRow>
          <ListRow last>
            <Text className="text-sm text-muted-foreground">
              Tipo de cuenta
            </Text>
            <Text className="text-base text-foreground">
              {user?.role === 'seller' ? 'Vendedor' : 'Comprador'}
            </Text>
          </ListRow>
        </ListGroup>

        <ListGroup title="Contacto">
          <View className="gap-3 p-4">
            <AppInput
              ref={phoneRef}
              label={
                user?.role === 'seller'
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
      </ScrollView>
    </ScreenShell>
  )
}
