import { Text, View } from 'react-native'
import { ThemeToggle } from './ThemeToggle'
import { AppButton } from './ui-kit'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/utils/errors'

export function SessionActions() {
  const { logout } = useAuth()
  const logoutError = logout.isError
    ? getApiErrorMessage(logout.error, 'Error al cerrar sesión')
    : null

  return (
    <View className="gap-3">
      <ThemeToggle />
      {logoutError ? (
        <Text accessibilityRole="alert" className="text-sm text-destructive">
          {logoutError}
        </Text>
      ) : null}
      <AppButton
        variant="destructive"
        onPress={() => logout.mutate()}
        loading={logout.isPending}
      >
        Cerrar sesión
      </AppButton>
    </View>
  )
}
