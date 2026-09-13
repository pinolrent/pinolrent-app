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
import { useAuth } from '@/hooks/useAuth'
import {
  getApiErrorMessage,
  validateEmail,
  validatePassword,
} from '@/utils/errors'
import { Brand } from '@/components/Brand'
import { AppButton, AppCard } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'
import { useBreakpoints } from '@/hooks/useBreakpoints'

const LOGIN_BG = require('../../src/assets/login-background.jpeg')

export default function LoginScreen() {
  const { isPhone } = useBreakpoints()
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

  const cardContent = (
    <>
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
        onChangeText={setEmail}
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

      {error && (
        <Text
          accessibilityRole="alert"
          className="text-center text-sm text-destructive"
        >
          {error}
        </Text>
      )}

      <AppButton onPress={onLogin} loading={login.isPending}>
        Iniciar sesión
      </AppButton>

      <Link href="/(auth)/register" className="mt-1 self-center px-3 py-3.5">
        <Text className="text-primary">Crear cuenta</Text>
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
