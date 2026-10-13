import type { ReactNode } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { AppButton, AppPressable, FormError } from '@/components/ui-kit'

// Filtros del admin: una fila de pastillas que se desplaza en pantallas
// angostas, con la opción vacía como "todas".
export function FilterPills<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly { value: T | ''; label: string }[]
  value: T | ''
  onChange: (value: T | '') => void
}) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {options.map((option) => {
          const selected = option.value === value
          return (
            <AppPressable
              key={option.value === '' ? 'all' : option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              aria-checked={selected}
              onPress={() => onChange(option.value)}
              className={`min-h-11 justify-center rounded-full border px-4 ${
                selected
                  ? 'border-primary bg-primary'
                  : 'border-border bg-card'
              }`}
            >
              <Text
                className={`text-sm ${
                  selected
                    ? 'font-semibold text-primary-foreground'
                    : 'text-foreground'
                }`}
              >
                {option.label}
              </Text>
            </AppPressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

export function ListFooter({
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  onLoadMore,
  children,
}: {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isFetchNextPageError: boolean
  onLoadMore: () => void
  children?: ReactNode
}) {
  return (
    <View className="gap-3 py-4">
      {children}
      {isFetchingNextPage ? (
        <ActivityIndicator
          accessibilityRole="progressbar"
          accessibilityLabel="Cargando más resultados"
        />
      ) : isFetchNextPageError ? (
        <View className="items-center gap-2">
          <FormError message="No pudimos cargar más resultados" />
          <AppButton variant="outline" size="sm" onPress={onLoadMore}>
            Reintentar
          </AppButton>
        </View>
      ) : hasNextPage ? (
        <View className="items-center">
          <AppButton variant="outline" size="sm" onPress={onLoadMore}>
            Cargar más
          </AppButton>
        </View>
      ) : null}
    </View>
  )
}
