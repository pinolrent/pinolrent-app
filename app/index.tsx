import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'

export default function Index() {
  const token = useAuthStore((s) => s.token)
  const router = useRouter()

  useEffect(() => {
    if (token === null) return
    if (token) {
      router.replace('/(authenticated)')
    } else {
      router.replace('/(auth)/login')
    }
  }, [token])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  )
}
