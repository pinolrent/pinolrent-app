import { useState } from 'react'
import { ActivityIndicator, Switch, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth, useBecomeSeller } from '@/hooks/useAuth'
import { ScreenShell } from '@/components/ScreenShell'
import {
  AppButton,
  CARD_SURFACE,
  FormError,
  ListGroup,
  ListRow,
} from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { getApiErrorMessage } from '@/utils/errors'
import { SessionActions } from '@/components/SessionActions'
import { BecomeSellerSheet } from '@/components/BecomeSellerSheet'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useThemeColors } from '@/hooks/useThemeColors'

export function ProfileScreen({ area }: { area: 'buyer' | 'seller' | 'admin' }) {
  const router = useRouter()
  const colors = useThemeColors()
  const { isWide, isDesktop } = useBreakpoints()
  const { user } = useAuth()
  const become = useBecomeSeller()
  const [becomeOpen, setBecomeOpen] = useState(false)

  const isAdmin = Boolean(user?.roles?.includes('admin'))
  const isSeller = Boolean(user?.roles?.includes('seller'))
  const isBuyer = Boolean(user?.roles?.includes('buyer'))
  const roleLabel = isAdmin
    ? 'Administrador'
    : isSeller && isBuyer
      ? 'Vendedor y comprador'
      : isSeller
        ? 'Vendedor'
        : 'Comprador'
  const initial = (user?.email?.[0] ?? '?').toUpperCase()
  const baseHref =
    area === 'admin'
      ? '/(authenticated)/admin'
      : area === 'seller'
        ? '/(authenticated)/seller'
        : '/(authenticated)/(buyer)'
  const editHref = `${baseHref}/profile/edit`

  const identity = (
    <View className="items-center gap-3 py-4">
      <View
        accessibilityLabel={`Cuenta de ${user?.email ?? ''}`}
        className="h-24 w-24 items-center justify-center rounded-full bg-primary/10"
      >
        <Text className="text-3xl font-bold text-primary">{initial}</Text>
      </View>
      <Text className="text-center text-lg font-semibold text-foreground">
        {user?.email}
      </Text>
      <StatusBadge tone="muted">{roleLabel}</StatusBadge>
    </View>
  )

  const enableSelling = () => {
    if (user?.phone) {
      become.mutate(user.phone, {
        onSuccess: () => router.replace('/(authenticated)/seller'),
      })
      return
    }
    setBecomeOpen(true)
  }

  const toggleMode = (next: boolean) => {
    if (!isSeller) {
      if (next) enableSelling()
      return
    }
    router.replace(
      next
        ? '/(authenticated)/seller'
        : isAdmin
          ? '/(authenticated)/admin'
          : '/(authenticated)/(buyer)'
    )
  }

  const toggleAdminMode = (next: boolean) => {
    router.replace(
      next
        ? '/(authenticated)/admin'
        : isSeller
          ? '/(authenticated)/seller'
          : '/(authenticated)/(buyer)'
    )
  }

  const becomeError = become.isError
    ? getApiErrorMessage(become.error, 'No pudimos habilitar tus autos')
    : null

  const modeRow = (
    <View className="min-h-14 flex-row items-center justify-between gap-3 px-4 py-3">
      <View className="flex-1">
        <Text className="text-base text-foreground">Vender mis autos</Text>
        <Text className="text-sm text-muted-foreground">
          {!isSeller
            ? 'Habilitá tus autos con un teléfono de contacto'
            : area === 'seller'
              ? 'Ahora estás vendiendo'
              : area === 'admin'
                ? 'Ahora estás administrando'
                : 'Ahora estás comprando'}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        {become.isPending ? (
          <ActivityIndicator
            accessibilityLabel="Habilitando tus autos"
            color={colors.mutedText}
          />
        ) : null}
        <Switch
          accessibilityLabel="Vender mis autos"
          value={isSeller && area === 'seller'}
          disabled={become.isPending}
          onValueChange={toggleMode}
          ios_backgroundColor={colors.border}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.card}
        />
      </View>
    </View>
  )

  const adminRow = (
    <View className="min-h-14 flex-row items-center justify-between gap-3 border-t border-border px-4 py-3">
      <View className="flex-1">
        <Text className="text-base text-foreground">
          Administrar la plataforma
        </Text>
        <Text className="text-sm text-muted-foreground">
          {area === 'admin'
            ? 'Ahora estás administrando'
            : 'Reservas, cuentas, autos y pagos'}
        </Text>
      </View>
      <Switch
        accessibilityLabel="Administrar la plataforma"
        value={area === 'admin'}
        onValueChange={toggleAdminMode}
        ios_backgroundColor={colors.border}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.card}
      />
    </View>
  )

  const groups = (
    <View className="gap-4">
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

      <ListGroup title="Modo">
        {modeRow}
        {isAdmin ? adminRow : null}
        <FormError message={becomeError} className="px-4 pb-3" />
      </ListGroup>

      {isDesktop ? null : (
        <ListGroup title="Sesión">
          <View className="p-4">
            <SessionActions />
          </View>
        </ListGroup>
      )}

      <BecomeSellerSheet
        visible={becomeOpen}
        onClose={() => setBecomeOpen(false)}
        initialPhone={user?.phone ?? ''}
        onEnabled={() => router.replace('/(authenticated)/seller')}
      />
    </View>
  )

  return (
    <ScreenShell
      title="Mi perfil"
      width={isWide ? 'default' : 'form'}
      scroll
      action={
        <AppButton variant="outline" onPress={() => router.push(editHref)}>
          Editar perfil
        </AppButton>
      }
    >
      {isWide ? (
        <View className="flex-row items-start gap-6">
          <View className={`w-80 ${CARD_SURFACE} p-4`}>
            {identity}
          </View>
          <View className="flex-1">{groups}</View>
        </View>
      ) : (
        <View className="gap-4">
          {identity}
          {groups}
        </View>
      )}
    </ScreenShell>
  )
}
