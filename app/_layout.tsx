import { useEffect } from 'react'
import { Platform } from 'react-native'
import { Slot } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaListener } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Uniwind } from 'uniwind'
import { GluestackUIProvider } from '../components/ui/gluestack-ui-provider'
import { THEME_COLORS } from '@/constants/theme-colors'
import { useAuthStore } from '@/stores/auth.store'
import { useThemeStore } from '@/stores/theme.store'
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
  const loadTheme = useThemeStore((s) => s.loadTheme)
  const theme = useThemeStore((s) => s.theme)
  const themeLoaded = useThemeStore((s) => s.isLoaded)

  useEffect(() => {
    loadFromStorage().catch(() => {
      useAuthStore.setState({ isLoaded: true })
    })
    loadTheme()
  }, [])

  useEffect(() => {
    // El build web sirve su shell por defecto en inglés; el idioma del
    // documento decide comillas, guionado y pronunciación. El shell propio
    // (+html) solo se usa en el modo de exportación estático.
    if (Platform.OS !== 'web') return
    const doc = (
      globalThis as {
        document?: { documentElement?: { lang?: string } }
      }
    ).document
    if (doc?.documentElement) doc.documentElement.lang = 'es'
  }, [])

  if (!themeLoaded) return null

  return (
    <SafeAreaListener
      onChange={({ insets }) => {
        Uniwind.updateInsets(insets)
      }}
    >
      <GestureHandlerRootView
        style={{ flex: 1, backgroundColor: THEME_COLORS[theme].background }}
      >
        <QueryClientProvider client={queryClient}>
          <GluestackUIProvider mode={theme}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <ErrorBoundary>
              <Slot />
            </ErrorBoundary>
          </GluestackUIProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaListener>
  )
}