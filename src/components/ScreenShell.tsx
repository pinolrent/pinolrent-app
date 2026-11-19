import type { ReactNode } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { SCREEN_WIDTH } from '@/constants/layout'
import { DISPLAY } from '@/constants/typography'

export function ScreenShell({
  title,
  subtitle,
  action,
  width = 'default',
  topInset = true,
  scroll = false,
  children,
}: {
  title?: string
  subtitle?: string
  action?: ReactNode
  width?: keyof typeof SCREEN_WIDTH
  topInset?: boolean
  scroll?: boolean
  children: ReactNode
}) {
  const { isPhone, isDesktop } = useBreakpoints()
  const insets = useSafeAreaInsets()
  // En escritorio el sidebar ya marca la sección: el título del cuerpo
  // sobra y quedan el subtítulo y la acción como barra de la pantalla.
  const showTitle = Boolean(title) && !isDesktop
  // El título cuenta siempre, aunque no se vea: en escritorio sin subtítulo ni
  // acción el bloque no se dibujaba y la pantalla se quedaba sin heading.
  const hasHeader = Boolean(title || subtitle || action)
  const vertical = isPhone ? 16 : 24

  return (
    <View className="flex-1 items-center bg-background">
      <View
        role="main"
        className={`w-full flex-1 ${isPhone ? 'gap-4 px-4' : 'gap-6 px-6'}`}
        style={{
          maxWidth: SCREEN_WIDTH[width],
          paddingTop: (topInset ? insets.top : 0) + vertical,
          // Las pantallas empujadas (topInset en false) no tienen tab bar que
          // consuma el indicador de inicio, así que el inset va acá.
          paddingBottom: vertical + (topInset ? 0 : insets.bottom),
        }}
      >
        {hasHeader && (
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              {showTitle ? (
                <Text
                  accessibilityRole="header"
                  style={DISPLAY}
                  className="text-2xl font-bold text-foreground"
                >
                  {title}
                </Text>
              ) : title ? (
                // En escritorio el sidebar ya marca la sección, pero sin esto
                // la pantalla no tiene ningún heading: un lector de pantalla
                // aterriza en una página sin título.
                <Text accessibilityRole="header" className="sr-only">
                  {title}
                </Text>
              ) : null}
              {subtitle ? (
                <Text
                  accessibilityLiveRegion="polite"
                  className="text-sm text-muted-foreground"
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
            {action ? (
              <View className="flex-row items-center gap-2">{action}</View>
            ) : null}
          </View>
        )}
        {scroll ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, gap: vertical, paddingBottom: 4 }}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </View>
    </View>
  )
}
