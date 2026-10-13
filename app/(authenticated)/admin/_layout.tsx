import { Stack } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { useThemeStore } from '@/stores/theme.store'
import { headerBackOptions } from '@/components/header-back'
import { headerColors } from '@/components/tab-bar'
import { LoadingState } from '@/components/ui-kit'

export default function AdminLayout() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isLoaded = useAuthStore((s) => s.isLoaded)
  const theme = useThemeStore((s) => s.theme)

  if (!isLoaded) {
    return <LoadingState />
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Protected guard={!!token && Boolean(user?.roles?.includes('admin'))}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="audit"
          options={{
            headerShown: true,
            title: 'Auditoría',
            ...headerBackOptions(theme, '/(authenticated)/admin'),
            ...headerColors(theme),
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: true,
            title: 'Notificaciones',
            ...headerBackOptions(theme, '/(authenticated)/admin'),
            ...headerColors(theme),
          }}
        />
        <Stack.Screen
          name="users/[id]"
          options={{
            headerShown: true,
            title: 'Cuenta',
            ...headerBackOptions(theme, '/(authenticated)/admin/users'),
            ...headerColors(theme),
          }}
        />
        <Stack.Screen
          name="cars/[id]"
          options={{
            headerShown: true,
            title: 'Auto',
            ...headerBackOptions(theme, '/(authenticated)/admin/cars'),
            ...headerColors(theme),
          }}
        />
        <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
        <Stack.Screen
          name="profile/password"
          options={{
            headerShown: true,
            title: 'Cambiar contraseña',
            ...headerBackOptions(theme, '/(authenticated)/admin/profile/edit'),
            ...headerColors(theme),
          }}
        />
      </Stack.Protected>
    </Stack>
  )
}
