import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { Link } from 'expo-router'
import { Button, ButtonText } from '../../components/ui/button'
import { useAuth } from '@/hooks/useAuth'

type Role = 'buyer' | 'seller'

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('buyer')
  const { register } = useAuth()

  const onRegister = () => {
    register.mutate({ email, password, role })
  }

  const error = register.isError
    ? (register.error as any)?.response?.data?.error ||
    register.error?.message ||
    'Error al registrarse'
    : null

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>

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

      <View style={styles.roleRow}>
        {(['buyer', 'seller'] as Role[]).map((r) => (
          <Pressable
            key={r}
            onPress={() => setRole(r)}
            style={[
              styles.roleButton,
              role === r && styles.roleButtonActive,
            ]}
          >
            <Text style={styles.roleText}>
              {r === 'buyer' ? 'Comprador' : 'Vendedor'}
            </Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        variant="default"
        onPress={onRegister}
        disabled={register.isPending}
      >
        {register.isPending ? (
          <ActivityIndicator />
        ) : (
          <ButtonText>Registrarse</ButtonText>
        )}
      </Button>

      <Link href="/login" style={styles.link}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
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
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#000' },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  roleRow: { flexDirection: 'row', gap: 8, marginVertical: 4 },
  roleButton: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  roleButtonActive: { backgroundColor: '#3b82f6' },
  roleText: { color: '#fff', fontSize: 16 },
  error: { color: '#ff6467', marginBottom: 4 },
  link: { marginTop: 12, alignSelf: 'center' },
  linkText: { color: '#3b82f6' },
})
