import { useRef, useState } from 'react'
import { Pressable, Text } from 'react-native'
import type { TextInput } from 'react-native'
import { Link } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import {
  getApiErrorMessage,
  validateEmail,
  validatePassword,
} from '@/utils/errors'
import { AppButton, FormError } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'
import { AuthShell } from '@/components/AuthShell'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [clientErrors, setClientErrors] = useState<{
    email?: string | null
    password?: string | null
  }>({})
  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const { login } = useAuth()

  const onLogin = () => {
    const trimmedEmail = email.trim()
    const emailError = validateEmail(trimmedEmail)
    const passwordError = validatePassword(password)
    setClientErrors({ email: emailError, password: passwordError })
    if (emailError || passwordError) {
      if (emailError) {
        emailRef.current?.focus()
      } else {
        passwordRef.current?.focus()
      }
      return
    }
    setEmail(trimmedEmail)
    login.mutate({ email: trimmedEmail, password })
  }

  const error = login.isError
    ? getApiErrorMessage(login.error, 'Error al iniciar sesión')
    : null

  return (
    <AuthShell>
      <Text
        accessibilityRole="header"
        className="mb-2 text-xl font-bold text-foreground"
      >
        Iniciar sesión
      </Text>

      <AppInput
        ref={emailRef}
        label="Email"
        placeholder="tucorreo@ejemplo.com"
        autoComplete="email"
        textContentType="emailAddress"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        returnKeyType="next"
        value={email}
        onChangeText={(v) => {
          setEmail(v)
          if (login.isError) login.reset()
        }}
        error={clientErrors.email}
      />

      <AppInput
        ref={passwordRef}
        label="Contraseña"
        placeholder="Tu contraseña"
        autoComplete="current-password"
        textContentType="password"
        autoCapitalize="none"
        secureTextEntry={!showPassword}
        returnKeyType="done"
        onSubmitEditing={onLogin}
        value={password}
        onChangeText={(v) => {
          setPassword(v)
          if (login.isError) login.reset()
        }}
        error={clientErrors.password}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
        }
        onPress={() => setShowPassword((v) => !v)}
        className="min-h-11 self-end justify-center rounded-lg px-2 py-3"
        style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
      >
        <Text className="text-sm text-primary">
          {showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        </Text>
      </Pressable>

      <FormError message={error} className="text-center" />

      <AppButton onPress={onLogin} loading={login.isPending}>
        Iniciar sesión
      </AppButton>
      <Link href="/(auth)/register" className="mt-1 self-center px-3 py-3.5">
        <Text className="text-primary">Crear cuenta</Text>
      </Link>
    </AuthShell>
  )
}
