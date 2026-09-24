import { useRef, useState } from 'react'
import { Text, View } from 'react-native'
import type { TextInput } from 'react-native'
import { Eye, EyeOff } from 'lucide-react-native'
import { useChangePassword } from '@/hooks/useAuth'
import {
  getApiErrorMessage,
  isInvalidCredentialsError,
  validatePassword,
} from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { AppButton, AppPressable, FormError } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'
import { useThemeColors } from '@/hooks/useThemeColors'

export function ProfilePasswordScreen() {
  const colors = useThemeColors()
  const change = useChangePassword()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState<{
    current?: string | null
    next?: string | null
    repeat?: string | null
  }>({})
  const currentRef = useRef<TextInput>(null)
  const nextRef = useRef<TextInput>(null)
  const repeatRef = useRef<TextInput>(null)

  const serverError = change.isError
    ? isInvalidCredentialsError(change.error)
      ? 'La contraseña actual no coincide'
      : getApiErrorMessage(change.error, 'No pudimos cambiar la contraseña')
    : null

  const onSubmit = () => {
    const currentError = current ? null : 'Ingresa tu contraseña actual'
    let nextError = validatePassword(next)
    if (!nextError && next === current) {
      nextError = 'La nueva contraseña debe ser distinta a la actual'
    }
    const repeatError = !repeat
      ? 'Repite la nueva contraseña'
      : repeat === next
        ? null
        : 'Las contraseñas no coinciden'
    setErrors({ current: currentError, next: nextError, repeat: repeatError })
    if (currentError || nextError || repeatError) {
      if (currentError) {
        currentRef.current?.focus()
      } else if (nextError) {
        nextRef.current?.focus()
      } else {
        repeatRef.current?.focus()
      }
      return
    }
    change.mutate({ current_password: current, new_password: next })
  }

  const eye = (
    <AppPressable
      accessibilityRole="button"
      accessibilityLabel={
        show ? 'Ocultar contraseñas' : 'Mostrar contraseñas'
      }
      onPress={() => setShow((v) => !v)}
      className="min-h-11 min-w-11 items-center justify-center rounded-lg"
    >
      {show ? (
        <EyeOff size={20} color={colors.mutedText} />
      ) : (
        <Eye size={20} color={colors.mutedText} />
      )}
    </AppPressable>
  )

  const secure = !show

  return (
    <ScreenShell width="form" topInset={false} scroll>
      <View className="max-w-md gap-4">
        <Text className="text-sm text-muted-foreground">
          Al cambiarla se cierran todas tus sesiones, incluida esta: tendrás que
          iniciar sesión de nuevo con la contraseña nueva.
        </Text>
        <AppInput
          ref={currentRef}
          label="Contraseña actual"
          placeholder="Tu contraseña actual"
          autoComplete="current-password"
          textContentType="password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={secure}
          returnKeyType="next"
          onSubmitEditing={() => nextRef.current?.focus()}
          value={current}
          onChangeText={(v) => {
            setCurrent(v)
            setErrors((e) => ({ ...e, current: null }))
            if (change.isError) change.reset()
          }}
          error={errors.current}
          trailing={eye}
        />
        <AppInput
          ref={nextRef}
          label="Nueva contraseña"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          textContentType="newPassword"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={secure}
          returnKeyType="next"
          onSubmitEditing={() => repeatRef.current?.focus()}
          value={next}
          onChangeText={(v) => {
            setNext(v)
            setErrors((e) => ({ ...e, next: null }))
            if (change.isError) change.reset()
          }}
          error={errors.next}
        />
        <AppInput
          ref={repeatRef}
          label="Repite la nueva contraseña"
          placeholder="Repite la nueva contraseña"
          autoComplete="new-password"
          textContentType="newPassword"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={secure}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          value={repeat}
          onChangeText={(v) => {
            setRepeat(v)
            setErrors((e) => ({ ...e, repeat: null }))
            if (change.isError) change.reset()
          }}
          error={errors.repeat}
        />
        <FormError message={serverError} className="text-center" />
        <AppButton onPress={onSubmit} loading={change.isPending}>
          Cambiar contraseña
        </AppButton>
      </View>
    </ScreenShell>
  )
}
