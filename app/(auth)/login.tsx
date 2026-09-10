import { useState } from 'react'
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { Link } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import {
  getApiErrorMessage,
  validateEmail,
  validatePassword,
} from '@/utils/errors'
import { AppButton, AppCard } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'

const LOGIN_BG = require('../../src/assets/login-background.jpeg')

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [clientErrors, setClientErrors] = useState<{
    email?: string | null
    password?: string | null
  }>({})
  const { login } = useAuth()

  const onLogin = () => {
    const trimmedEmail = email.trim()
    const emailError = validateEmail(trimmedEmail)
    const passwordError = validatePassword(password)
    setClientErrors({ email: emailError, password: passwordError })
    if (emailError || passwordError) return
    setEmail(trimmedEmail)
    login.mutate({ email: trimmedEmail, password })
  }

  const error = login.isError
    ? getApiErrorMessage(login.error, 'Error al iniciar sesión')
    : null

  return (
    <View className="flex-1 overflow-hidden bg-background">
      <ImageBackground
        source={LOGIN_BG}
        resizeMode="cover"
        className="absolute inset-0 h-full w-full"
      />
      <View className="absolute inset-0 bg-overlay opacity-70" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <View className="w-full max-w-md gap-3">
          <AppCard className="gap-3 p-6">
            <Text className="mb-2 text-center text-2xl font-bold text-foreground">
              Iniciar sesión
            </Text>

            <AppInput
              label="Email"
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={clientErrors.email}
            />

            <AppInput
              label="Contraseña"
              placeholder="Contraseña"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              error={clientErrors.password}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowPassword((v) => !v)}
              className="self-end"
            >
              <Text className="text-sm text-primary">
                {showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              </Text>
            </Pressable>

            {error && (
              <Text className="text-center text-sm text-destructive">
                {error}
              </Text>
            )}

            <AppButton onPress={onLogin} disabled={login.isPending}>
              {login.isPending ? <ActivityIndicator /> : 'Entrar'}
            </AppButton>

            <Link href="/(auth)/register" className="mt-1 self-center">
              <Text className="text-primary">
                ¿No tienes cuenta? Regístrate
              </Text>
            </Link>
          </AppCard>
        </View>
      </ScrollView>
    </View>
  )
}
