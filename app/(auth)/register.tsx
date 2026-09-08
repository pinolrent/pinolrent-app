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
import { getApiErrorMessage } from '@/utils/errors'
import { AppButton, AppCard } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'

type Role = 'buyer' | 'seller'

const LOGIN_BG = require('../../src/assets/login-background.jpeg')

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('buyer')
  const { register } = useAuth()

  const onRegister = () => {
    register.mutate({ email, password, role })
  }

  const error = register.isError
    ? getApiErrorMessage(register.error, 'Error al registrarse')
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
              Crear cuenta
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

            <View className="my-1 flex-row gap-2">
              {(['buyer', 'seller'] as Role[]).map((r) => (
                <Pressable
                  key={r}
                  accessibilityRole="button"
                  onPress={() => setRole(r)}
                  className={`flex-1 items-center rounded-lg p-3 ${
                    role === r ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <Text
                    className={
                      role === r
                        ? 'text-primary-foreground'
                        : 'text-foreground'
                    }
                  >
                    {r === 'buyer' ? 'Comprador' : 'Vendedor'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {error && (
              <Text className="text-center text-sm text-destructive">
                {error}
              </Text>
            )}

            <AppButton onPress={onRegister} disabled={register.isPending}>
              {register.isPending ? <ActivityIndicator /> : 'Registrarse'}
            </AppButton>

            <Link href="/login" className="mt-1 self-center">
              <Text className="text-primary">
                ¿Ya tienes cuenta? Inicia sesión
              </Text>
            </Link>
          </AppCard>
        </View>
      </ScrollView>
    </View>
  )
}
