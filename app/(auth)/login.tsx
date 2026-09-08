import { useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { Link } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/utils/errors'
import { AppButton } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'
import { ThemeToggle } from '@/components/ThemeToggle'

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
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 items-end p-4">
        <ThemeToggle />
      </View>
      <View className="flex-1 justify-center gap-3 p-6">
        <Text className="mb-4 text-2xl font-bold text-foreground">
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
          <Text className="text-sm text-destructive">{error}</Text>
        )}

        <AppButton onPress={onLogin} disabled={login.isPending}>
          {login.isPending ? <ActivityIndicator /> : 'Entrar'}
        </AppButton>

        <Link href="/register" className="mt-3 self-center">
          <Text className="text-primary">¿No tienes cuenta? Regístrate</Text>
        </Link>
      </View>
    </ScrollView>
  )
}
