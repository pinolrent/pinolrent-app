import { useRef, useState } from 'react'
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import type { TextInput } from 'react-native'
import { Link } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import {
  getApiErrorMessage,
  validateEmail,
  validatePassword,
  validatePhone,
} from '@/utils/errors'
import { Brand } from '@/components/Brand'
import { AppButton, AppCard, FormError } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'
import { ChoiceGroup } from '@/components/ChoiceGroup'
import { useBreakpoints } from '@/hooks/useBreakpoints'

type Role = 'buyer' | 'seller'

const ROLE_OPTIONS = [
  { value: 'buyer', label: 'Comprador' },
  { value: 'seller', label: 'Vendedor' },
] as const

const LOGIN_BG = require('../../src/assets/login-background.jpeg')

export default function RegisterScreen() {
  const { isPhone } = useBreakpoints()
  const { width, height } = useWindowDimensions()
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

  const cardContent = (
    <>
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
        value={password}
        onChangeText={(v) => {
          setPassword(v)
          if (register.isError) register.reset()
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

      <ChoiceGroup
        label="Tipo de cuenta"
        options={ROLE_OPTIONS}
        value={role}
        onChange={setRole}
        className="my-1"
      />

      <AppInput
        ref={phoneRef}
        label={role === 'seller' ? 'Teléfono' : 'Teléfono (opcional)'}
        placeholder="Tu WhatsApp"
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
        <Text className="text-primary">Iniciar sesión</Text>
      </Link>
    </>
  )

  const form = (
    <View className="w-full max-w-md gap-4">
      {isPhone ? (
        <AppCard padding="lg">
          <Brand />
          <View className="h-px bg-border" />
          {cardContent}
        </AppCard>
      ) : (
        <>
          <Brand />
          <AppCard padding="xl">{cardContent}</AppCard>
        </>
      )}
    </View>
  )

  if (!isPhone) {
    return (
      <View className="flex-1 flex-row bg-background">
        <ImageBackground
          source={LOGIN_BG}
          resizeMode="cover"
          accessible={false}
          className="flex-1"
        />
        <View className="w-full max-w-[520px] flex-1 items-center justify-center bg-background p-8">
          {form}
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <ImageBackground
        source={LOGIN_BG}
        resizeMode="cover"
        accessible={false}
        style={{
          width: '100%',
          height: Math.round(Math.min(width / 1.5, height * 0.42)),
          flexGrow: 0,
          flexShrink: 0,
        }}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}
        >
          {form}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}
