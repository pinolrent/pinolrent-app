import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { Brand } from '@/components/Brand'
import { AppCard } from '@/components/ui-kit'

// Sin foto de stock: la portada es el color de marca del producto, el nombre
// arriba de la tarjeta y el formulario solo. Una foto genérica de auto no
// decía nada del servicio y competía con el único dato que importa acá.
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    // En oscuro el campo baja al fondo de la app para que la tarjeta quede
    // por encima suyo, como corresponde a una superficie elevada.
    <View className="flex-1 bg-secondary dark:bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}
        >
          <View className="w-full max-w-md gap-4">
            <View className="px-1">
              <Brand />
            </View>
            <AppCard padding="xl">{children}</AppCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}
