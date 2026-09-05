import { useEffect } from 'react'
import { Slot, useRouter } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaListener } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { GluestackUIProvider } from '../components/ui/gluestack-ui-provider'
import { useAuthStore } from '@/stores/auth.store'
import '../global.css'

const queryClient = new QueryClient()

export default function RootLayout() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage)
  const token = useAuthStore((s) => s.token)
  const router = useRouter()

  useEffect(() => {
    loadFromStorage()
  }, [])

  useEffect(() => {
    if (token === null) return
    if (token) {
      router.replace('/(authenticated)')
    } else {
      router.replace('/(auth)/login')
    }
  }, [token])

  return (
    <SafeAreaListener onChange={() => {}}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <GluestackUIProvider mode="dark">
            <StatusBar style="auto" />
            <Slot />
          </GluestackUIProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaListener>
  )
}
