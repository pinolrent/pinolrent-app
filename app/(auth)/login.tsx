import { useState } from 'react'
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { Link } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/utils/errors'
import { AppButton, AppCard } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'
import { ThemeToggle } from '@/components/ThemeToggle'

const LOGIN_BG = require('../../src/assets/login-background.jpeg')

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()

  const onLogin = () => {
    login.mutate({ email, password })
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
      <View className="absolute inset-0 bg-background/70 dark:bg-background/80" />
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
          <View className="items-end">
            <ThemeToggle />
          </View>
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
            />

            <AppInput
              label="Contraseña"
              placeholder="Contraseña"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error && (
              <Text className="text-center text-sm text-destructive">
                {error}
              </Text>
            )}

            <AppButton onPress={onLogin} disabled={login.isPending}>
              {login.isPending ? <ActivityIndicator /> : 'Entrar'}
            </AppButton>

            <Link href="/register" className="mt-1 self-center">
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
