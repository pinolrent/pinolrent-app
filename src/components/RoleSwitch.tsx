import { useState } from 'react'
import { ActivityIndicator, Switch, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth, useBecomeSeller } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/utils/errors'
import { AppCard, FormError } from '@/components/ui-kit'
import { BecomeSellerSheet } from '@/components/BecomeSellerSheet'
import { useThemeColors } from '@/hooks/useThemeColors'

export function RoleSwitch({ area }: { area: 'buyer' | 'seller' }) {
  const router = useRouter()
  const colors = useThemeColors()
  const { user } = useAuth()
  const become = useBecomeSeller()
  const [becomeOpen, setBecomeOpen] = useState(false)

  const isSeller = Boolean(user?.roles?.includes('seller'))

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
      next ? '/(authenticated)/seller' : '/(authenticated)/(buyer)'
    )
  }

  const becomeError = become.isError
    ? getApiErrorMessage(become.error, 'No pudimos habilitar tus autos')
    : null

  return (
    <AppCard gap="sm">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base text-foreground">Vender mis autos</Text>
          <Text className="text-sm text-muted-foreground">
            {!isSeller
              ? 'Habilitá tus autos con un teléfono de contacto'
              : area === 'seller'
                ? 'Ahora estás vendiendo'
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
      <FormError message={becomeError} />
      <BecomeSellerSheet
        visible={becomeOpen}
        onClose={() => setBecomeOpen(false)}
        initialPhone={user?.phone ?? ''}
        onEnabled={() => router.replace('/(authenticated)/seller')}
      />
    </AppCard>
  )
}
