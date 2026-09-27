import { useState } from 'react'
import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { useAuth } from '@/hooks/useAuth'
import { ScreenShell } from '@/components/ScreenShell'
import { AppButton, AppPressable, ListGroup, ListRow } from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { SessionActions } from '@/components/SessionActions'
import { BecomeSellerSheet } from '@/components/BecomeSellerSheet'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useThemeColors } from '@/hooks/useThemeColors'

export function ProfileScreen({ area }: { area: 'buyer' | 'seller' }) {
  const router = useRouter()
  const colors = useThemeColors()
  const { isWide } = useBreakpoints()
  const { user } = useAuth()
  const [becomeOpen, setBecomeOpen] = useState(false)

  const isSeller = Boolean(user?.roles?.includes('seller'))
  const isBuyer = Boolean(user?.roles?.includes('buyer'))
  const roleLabel =
    isSeller && isBuyer
      ? 'Vendedor y comprador'
      : isSeller
        ? 'Vendedor'
        : 'Comprador'
  const initial = (user?.email?.[0] ?? '?').toUpperCase()
  const editHref = isSeller
    ? '/(authenticated)/seller/profile/edit'
    : '/(authenticated)/(buyer)/profile/edit'

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

  const modeLabel = isSeller
    ? area === 'seller'
      ? 'Ir a comprar'
      : 'Ir a vender'
    : 'Ofertar mi auto'

  const modeRow = (
    <AppPressable
      accessibilityRole="button"
      accessibilityLabel={modeLabel}
      onPress={() => {
        if (!isSeller) {
          setBecomeOpen(true)
          return
        }
        router.replace(
          area === 'seller'
            ? '/(authenticated)/(buyer)'
            : '/(authenticated)/seller'
        )
      }}
      hoverClassName="bg-accent"
      className="min-h-14 flex-row items-center justify-between gap-3 px-4 py-3"
    >
      <View className="flex-1">
        <Text className="text-base text-foreground">{modeLabel}</Text>
        {!isSeller ? (
          <Text className="text-sm text-muted-foreground">
            Habilitá tus autos con un teléfono de contacto
          </Text>
        ) : null}
      </View>
      <ChevronRight size={20} color={colors.mutedText} />
    </AppPressable>
  )

  const groups = (
    <View className="gap-4">
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

      <ListGroup title="Modo">{modeRow}</ListGroup>

      <ListGroup title="Sesión">
        <View className="p-4">
          <SessionActions />
        </View>
      </ListGroup>

      <BecomeSellerSheet
        visible={becomeOpen}
        onClose={() => setBecomeOpen(false)}
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
          <View className="w-80 rounded-xl border border-border bg-card p-4">
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
