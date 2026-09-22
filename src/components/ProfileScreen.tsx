import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { ScreenShell } from '@/components/ScreenShell'
import { AppButton, ListGroup, ListRow } from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { SessionActions } from '@/components/SessionActions'

export function ProfileScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const roleLabel = user?.role === 'seller' ? 'Vendedor' : 'Comprador'
  const initial = (user?.email?.[0] ?? '?').toUpperCase()
  const editHref =
    user?.role === 'seller'
      ? '/(authenticated)/seller/profile/edit'
      : '/(authenticated)/(buyer)/profile/edit'

  return (
    <ScreenShell
      title="Mi perfil"
      width="form"
      action={
        <AppButton variant="outline" onPress={() => router.push(editHref)}>
          Editar perfil
        </AppButton>
      }
    >
      <View className="items-center gap-3 py-4">
        <View
          accessibilityLabel={`Cuenta de ${user?.email ?? ''}`}
          className="h-24 w-24 items-center justify-center rounded-full bg-primary/10"
        >
          <Text className="text-3xl font-bold text-primary">{initial}</Text>
        </View>
        <Text
          numberOfLines={1}
          className="text-lg font-semibold text-foreground"
        >
          {user?.email}
        </Text>
        <StatusBadge tone="muted">{roleLabel}</StatusBadge>
      </View>

      <ListGroup title="Cuenta">
        <ListRow>
          <Text className="text-sm text-muted-foreground">Email</Text>
          <Text
            numberOfLines={1}
            className="flex-1 text-right text-base text-foreground"
          >
            {user?.email}
          </Text>
        </ListRow>
        <ListRow last>
          <Text className="text-sm text-muted-foreground">Tipo de cuenta</Text>
          <Text className="text-base text-foreground">{roleLabel}</Text>
        </ListRow>
      </ListGroup>

      <ListGroup title="Contacto">
        <ListRow last>
          <Text className="text-sm text-muted-foreground">
            Teléfono (WhatsApp)
          </Text>
          <Text className="text-base text-foreground">
            {user?.phone || 'Sin teléfono'}
          </Text>
        </ListRow>
      </ListGroup>

      <ListGroup title="Sesión">
        <View className="p-4">
          <SessionActions />
        </View>
      </ListGroup>
    </ScreenShell>
  )
}
