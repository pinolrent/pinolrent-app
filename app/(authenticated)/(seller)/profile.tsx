import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useAuth, useUpdateProfile } from '@/hooks/useAuth'
import { getApiErrorMessage, validatePhone } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { AppButton, AppCard, FormError, SuccessNote } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'

export default function SellerProfileScreen() {
  const { user } = useAuth()
  const update = useUpdateProfile()
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [clientError, setClientError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const serverError = update.isError
    ? getApiErrorMessage(update.error, 'Error al actualizar el teléfono')
    : null

  const onSave = () => {
    const trimmed = phone.trim()
    const error = validatePhone(trimmed, user?.role === 'seller')
    setClientError(error)
    if (error) return
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
    <ScreenShell back title="Mi perfil" width="form">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        <AppCard>
          <View className="gap-1">
            <Text className="text-sm text-muted-foreground">Email</Text>
            <Text className="text-base text-foreground">{user?.email}</Text>
          </View>
          <View className="gap-1">
            <Text className="text-sm text-muted-foreground">Rol</Text>
            <Text className="text-base text-foreground">
              {user?.role === 'seller' ? 'Vendedor' : 'Comprador'}
            </Text>
          </View>
          <AppInput
            label="Teléfono (WhatsApp)"
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
              setSaved(false)
              update.reset()
            }}
          />
          <FormError message={clientError ?? serverError} />
          <SuccessNote message={saved ? 'Teléfono actualizado' : null} />
          <AppButton onPress={onSave} loading={update.isPending}>
            Guardar teléfono
          </AppButton>
        </AppCard>
      </ScrollView>
    </ScreenShell>
  )
}
