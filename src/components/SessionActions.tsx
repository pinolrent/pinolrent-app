import { useState } from 'react'
import { View } from 'react-native'
import { ThemeToggle } from './ThemeToggle'
import { AppButton, FormError } from './ui-kit'
import { ConfirmDialog } from './ConfirmDialog'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/utils/errors'

export function SessionActions() {
  const { logout } = useAuth()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const logoutError = logout.isError
    ? getApiErrorMessage(logout.error, 'Error al cerrar sesión')
    : null

  return (
    <View className="gap-3">
      <ThemeToggle />
      <FormError message={logoutError} />
      <AppButton
        variant="destructive"
        onPress={() => setConfirmOpen(true)}
        loading={logout.isPending}
      >
        Cerrar sesión
      </AppButton>
      <ConfirmDialog
        visible={confirmOpen}
        title="Cerrar sesión"
        message="¿Seguro que querés cerrar sesión?"
        confirmLabel="Cerrar sesión"
        destructive
        loading={logout.isPending}
        error={logoutError}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => logout.mutate()}
      />
    </View>
  )
}
