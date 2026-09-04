import { View, Text, StyleSheet } from 'react-native'
import { Button, ButtonText } from '../../../components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export default function BuyerHomeScreen() {
  const { user, logout } = useAuth()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de comprador</Text>
      <Text style={styles.subtitle}>Hola, {user?.email}</Text>

      <Button variant="default" onPress={() => logout.mutate()}>
        <ButtonText>Cerrar sesión</ButtonText>
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: '#aaa' },
})