import { useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useAuth, useUpdateProfile } from '@/hooks/useAuth'
import { getApiErrorMessage, validatePhone } from '@/utils/errors'
import { AppBackButton } from '@/components/nav-icons'
import { AppButton, AppCard, FormError } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'

export default function ProfileScreen() {
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
    update.mutate(trimmed, { onSuccess: () => setSaved(true) })
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, gap: 12 }}
    >
      <AppBackButton />
      <Text className="text-2xl font-bold text-foreground">Mi perfil</Text>
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
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
          value={phone}
          onChangeText={(v) => {
            setPhone(v)
            setSaved(false)
            update.reset()
          }}
        />
        <FormError message={clientError ?? serverError} />
        {saved && (
          <Text className="text-sm text-foreground">
            Teléfono actualizado
          </Text>
        )}
        <AppButton onPress={onSave} disabled={update.isPending}>
          {update.isPending ? <ActivityIndicator /> : 'Guardar teléfono'}
        </AppButton>
      </AppCard>
    </ScrollView>
  )
}
