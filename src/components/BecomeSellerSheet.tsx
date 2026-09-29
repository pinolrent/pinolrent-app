import { useEffect, useRef, useState } from 'react'
import { Text } from 'react-native'
import type { TextInput } from 'react-native'
import { useBecomeSeller } from '@/hooks/useAuth'
import { getApiErrorMessage, validatePhone } from '@/utils/errors'
import { ModalSheet } from '@/components/ModalSheet'
import { AppButton, FormError } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'

export function BecomeSellerSheet({
  visible,
  onClose,
  initialPhone = '',
  onEnabled,
}: {
  visible: boolean
  onClose: () => void
  initialPhone?: string
  onEnabled?: () => void
}) {
  const become = useBecomeSeller()
  const inputRef = useRef<TextInput>(null)
  const [phone, setPhone] = useState(initialPhone)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (visible) setPhone(initialPhone)
  }, [visible, initialPhone])

  const serverError = become.isError
    ? getApiErrorMessage(become.error, 'No pudimos habilitar tus autos')
    : null

  const close = () => {
    setPhone('')
    setError(null)
    become.reset()
    onClose()
  }

  const submit = () => {
    const trimmed = phone.trim()
    const validation = validatePhone(trimmed, true)
    setError(validation)
    if (validation) {
      inputRef.current?.focus()
      return
    }
    become.mutate(trimmed, {
      onSuccess: () => {
        onEnabled?.()
        close()
      },
    })
  }

  return (
    <ModalSheet
      visible={visible}
      onClose={close}
      title="Ofertar mi auto"
      busy={become.isPending}
    >
      <Text className="text-sm text-muted-foreground">
        Con tu teléfono, los compradores te escriben por WhatsApp. La misma
        cuenta sigue rentando autos.
      </Text>
      <AppInput
        ref={inputRef}
        label="Teléfono (WhatsApp)"
        placeholder="Ej. +505 8888 8888"
        autoComplete="tel"
        textContentType="telephoneNumber"
        keyboardType="phone-pad"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={submit}
        value={phone}
        onChangeText={(v) => {
          setPhone(v)
          setError(null)
          if (become.isError) become.reset()
        }}
        error={error}
      />
      <FormError message={serverError} />
      <AppButton onPress={submit} loading={become.isPending}>
        Empezar a vender
      </AppButton>
    </ModalSheet>
  )
}
