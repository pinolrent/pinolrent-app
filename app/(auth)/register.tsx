import { useRef, useState } from 'react'
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import type { TextInput } from 'react-native'
import { Link } from 'expo-router'
import { Check } from 'lucide-react-native'
import { useAuth } from '@/hooks/useAuth'
import {
  getApiErrorMessage,
  validateEmail,
  validatePassword,
  validatePhone,
} from '@/utils/errors'
import { Brand } from '@/components/Brand'
import { AppButton, AppCard } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'
import { useBreakpoints } from '@/hooks/useBreakpoints'

type Role = 'buyer' | 'seller'

const LOGIN_BG = require('../../src/assets/login-background.jpeg')

export default function RegisterScreen() {
  const { isPhone } = useBreakpoints()
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
        onChangeText={setEmail}
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
        onChangeText={setPassword}
        error={clientErrors.password}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => setShowPassword((v) => !v)}
        className="self-end rounded-lg px-2 py-3"
      >
        <Text className="text-sm text-primary">
          {showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        </Text>
      </Pressable>

      <AppInput
        ref={phoneRef}
        label="Teléfono"
        placeholder="Tu WhatsApp"
        autoComplete="tel"
        textContentType="telephoneNumber"
        keyboardType="phone-pad"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={onRegister}
        value={phone}
        onChangeText={setPhone}
        error={clientErrors.phone}
      />

      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Tipo de cuenta"
        className="my-1 flex-row gap-2"
      >
        {(['buyer', 'seller'] as Role[]).map((r) => {
          const selected = role === r
          return (
            <Pressable
              key={r}
              accessibilityRole="radio"
              aria-checked={selected}
              accessibilityState={{ checked: selected }}
              onPress={() => setRole(r)}
              className={`min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-lg px-3 py-2 ${
                selected ? 'bg-primary' : 'bg-muted'
              }`}
              style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
            >
              {selected ? <Check size={16} color="#FFFFFF" /> : null}
              <Text
                className={
                  selected ? 'text-primary-foreground' : 'text-foreground'
                }
              >
                {r === 'buyer' ? 'Comprador' : 'Vendedor'}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {error && (
        <Text
          accessibilityRole="alert"
          className="text-center text-sm text-destructive"
        >
          {error}
        </Text>
      )}

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
        <AppCard className="gap-3 p-6">
          <Brand />
          <View className="h-px bg-border" />
          {cardContent}
        </AppCard>
      ) : (
        <>
          <Brand />
          <AppCard className="gap-3 p-6">{cardContent}</AppCard>
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
        <View className="w-[520px] items-center justify-center bg-background p-8">
          {form}
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 overflow-hidden bg-background">
      <ImageBackground
        source={LOGIN_BG}
        resizeMode="cover"
        accessible={false}
        className="absolute inset-0 h-full w-full"
      />
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="absolute inset-0 bg-overlay opacity-70"
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
            padding: 24,
          }}
        >
          {form}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}
