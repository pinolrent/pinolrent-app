import { useEffect } from 'react'
import { Slot } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaListener } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Uniwind } from 'uniwind'
import { GluestackUIProvider } from '../components/ui/gluestack-ui-provider'
import { useAuthStore } from '@/stores/auth.store'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import '../global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
})

export default function RootLayout() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage)

  useEffect(() => {
    loadFromStorage()
  }, [])

  return (
    <SafeAreaListener
      onChange={({ insets }) => {
        Uniwind.updateInsets(insets)
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <GluestackUIProvider mode="dark">
            <StatusBar style="auto" />
            <ErrorBoundary>
              <Slot />
            </ErrorBoundary>
          </GluestackUIProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaListener>
  )
}