import { useRef, useState } from 'react'
import { Text } from 'react-native'
import type { TextInput } from 'react-native'
import { Link } from 'expo-router'
import { Eye, EyeOff } from 'lucide-react-native'
import { useAuth } from '@/hooks/useAuth'
import {
  getApiErrorMessage,
  validateEmail,
  validatePassword,
  validatePhone,
} from '@/utils/errors'
import { AppButton, AppPressable, FormError } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'
import { ChoiceGroup } from '@/components/ChoiceGroup'
import { AuthShell } from '@/components/AuthShell'
import { useThemeColors } from '@/hooks/useThemeColors'

type Role = 'buyer' | 'seller'

const ROLE_OPTIONS = [
  { value: 'buyer', label: 'Rentar auto' },
  { value: 'seller', label: 'Ofertar mi auto' },
] as const

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [clientErrors, setClientErrors] = useState<{
    email?: string | null
    password?: string | null
    phone?: string | null
  }>({})
  const [role, setRole] = useState<Role>('buyer')
  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)
  const colors = useThemeColors()
  const { register } = useAuth()

  const onRegister = () => {
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()
    const emailError = validateEmail(trimmedEmail)
    const passwordError = validatePassword(password)
    const phoneError = validatePhone(trimmedPhone, role === 'seller')
    setClientErrors({
      email: emailError,
      password: passwordError,
      phone: phoneError,
    })
    if (emailError || passwordError || phoneError) {
      if (emailError) {
        emailRef.current?.focus()
      } else if (passwordError) {
        passwordRef.current?.focus()
      } else {
        phoneRef.current?.focus()
      }
      return
    }
    setEmail(trimmedEmail)
    register.mutate({
      email: trimmedEmail,
      password,
      ...(trimmedPhone ? { phone: trimmedPhone } : {}),
      role,
    })
  }

  const error = register.isError
    ? getApiErrorMessage(register.error, 'Error al registrarse')
    : null

  return (
    <AuthShell>
      <Text
        accessibilityRole="header"
        className="mb-2 text-xl font-bold text-foreground"
      >
        Crear cuenta
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
        onSubmitEditing={() => passwordRef.current?.focus()}
        value={email}
        onChangeText={(v) => {
          setEmail(v)
          if (register.isError) register.reset()
        }}
        error={clientErrors.email}
      />

      <AppInput
        ref={passwordRef}
        label="Contraseña"
        placeholder="Mínimo 8 caracteres"
        autoComplete="new-password"
        textContentType="newPassword"
        autoCapitalize="none"
        secureTextEntry={!showPassword}
        returnKeyType="next"
        onSubmitEditing={() => phoneRef.current?.focus()}
        value={password}
        onChangeText={(v) => {
          setPassword(v)
          if (register.isError) register.reset()
        }}
        error={clientErrors.password}
        trailing={
          <AppPressable
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
            onPress={() => setShowPassword((v) => !v)}
            className="min-h-11 min-w-11 items-center justify-center rounded-lg"
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.mutedText} />
            ) : (
              <Eye size={20} color={colors.mutedText} />
            )}
          </AppPressable>
        }
      />

      <ChoiceGroup
        label="Tipo de cuenta"
        options={ROLE_OPTIONS}
        value={role}
        onChange={setRole}
        className="my-1"
      />

      <AppInput
        ref={phoneRef}
        label={role === 'seller' ? 'Teléfono' : 'Numero de Whatsapp'}
        placeholder="Ej: +505 11111111"
        autoComplete="tel"
        textContentType="telephoneNumber"
        keyboardType="phone-pad"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={onRegister}
        value={phone}
        onChangeText={(v) => {
          setPhone(v)
          if (register.isError) register.reset()
        }}
        error={clientErrors.phone}
      />

      <FormError message={error} className="text-center" />

      <AppButton onPress={onRegister} loading={register.isPending}>
        Crear cuenta
      </AppButton>

      <Link href="/(auth)/login" className="mt-1 self-center px-3 py-3.5">
        <Text className="text-base text-primary">Iniciar sesión</Text>
      </Link>
    </AuthShell>
  )
}
