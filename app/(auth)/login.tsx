import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { Link } from 'expo-router'
import { Button, ButtonText } from '../../components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()

  const onLogin = () => {
    login.mutate({ email, password })
  }

  const error = login.isError
    ? (login.error as any)?.response?.data?.error ||
      login.error?.message ||
      'Error al iniciar sesión'
    : null

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button variant="default" onPress={onLogin} disabled={login.isPending}>
        {login.isPending ? (
          <ActivityIndicator />
        ) : (
          <ButtonText>Entrar</ButtonText>
        )}
      </Button>

      <Link href="/register" style={styles.link}>
        <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#fff' },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  error: { color: '#ff6467', marginBottom: 4 },
  link: { marginTop: 12, alignSelf: 'center' },
  linkText: { color: '#3b82f6' },
})
