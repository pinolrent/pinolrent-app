import type { ComponentProps, ReactNode } from 'react'
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native'
import Animated from 'react-native-reanimated'
import { ChevronRight } from 'lucide-react-native'
import { enterFade } from '@/constants/motion'
import { useReduceMotion } from '@/hooks/useReduceMotion'
import { Button, ButtonSpinner, ButtonText } from '../../components/ui/button'
import { useHover } from '@/hooks/useHover'
import { useThemeColors } from '@/hooks/useThemeColors'
import { SECTION_LABEL, NUMERIC } from '@/constants/typography'

type Variant =
  | 'default'
  | 'destructive'
  | 'destructive-outline'
  | 'outline'
  | 'secondary'
  | 'ghost'

// Sin sombra: la profundidad de una superficie la dice su borde, no una
// sombra clara repetida debajo de cada caja.
export const CARD_SURFACE = 'rounded-xl border border-border bg-card'

// Las filas de una tabla o de una lista larga llevan la superficie ellas mismas:
// un contenedor que scrollea no puede dibujar un borde que termine donde
// termina el último dato, y la lista queda con un bloque vacío al pie.
export function rowSurface(first = false, last = false) {
  return `border-x border-b border-border bg-card ${
    first ? 'rounded-t-xl border-t' : ''
  } ${last ? 'rounded-b-xl' : ''}`
}

// Los props extra importan: en Android ScrollView clona este elemento y le
// pasa el contenido como children, así que hay que reenviarlos.
export function AppRefreshControl({
  refreshing,
  onRefresh,
  ...rest
}: Omit<ComponentProps<typeof RefreshControl>, 'refreshing' | 'onRefresh'> & {
  refreshing: boolean
  onRefresh: () => void
}) {
  const colors = useThemeColors()
  return (
    <RefreshControl
      {...rest}
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.primary}
      colors={[colors.primary]}
      progressBackgroundColor={colors.card}
    />
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text
      accessibilityRole="header"
      // Nivel 2: el 1 es el título de la pantalla. Sin esto cada rótulo de
      // sección competía con él y la página terminaba con varios h1.
      aria-level={2}
      style={SECTION_LABEL}
      className="px-1 text-sm font-semibold text-muted-foreground"
    >
      {children}
    </Text>
  )
}

const PRESSED_STYLE = { opacity: 0.7, transform: [{ scale: 0.98 }] }

export function AppButton({
  children,
  variant = 'default',
  className = '',
  loading = false,
  disabled,
  ...props
}: {
  children: ReactNode
  variant?: Variant
  loading?: boolean
} & Omit<ComponentProps<typeof Button>, 'variant' | 'children'>) {
  const colors = useThemeColors()
  return (
    <Button
      variant={variant}
      className={`data-[active=true]:scale-[0.98] ${className}`}
      {...(Platform.OS === 'android'
        ? {
            android_ripple: {
              color: `${colors.mutedText}33`,
              borderless: false,
            },
          }
        : {})}
      {...props}
      isDisabled={disabled || loading}
      disabled={disabled || loading}
      accessibilityState={{
        ...props.accessibilityState,
        busy: loading,
        disabled: Boolean(disabled || loading),
      }}
    >
      {loading ? (
        <ButtonSpinner
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      ) : null}
      <ButtonText>{children}</ButtonText>
    </Button>
  )
}

export function AppPressable({
  hoverClassName,
  className = '',
  style,
  children,
  ...rest
}: Omit<ComponentProps<typeof Pressable>, 'children'> & {
  children?: ReactNode
  hoverClassName?: string
}) {
  const { hovered, hoverProps } = useHover()
  const colors = useThemeColors()

  return (
    <Pressable
      {...rest}
      {...(hoverClassName ? hoverProps : {})}
      android_ripple={{ color: `${colors.mutedText}22`, borderless: false }}
      className={`${className}${
        hoverClassName && hovered ? ` ${hoverClassName}` : ''
      }`}
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        state.pressed ? PRESSED_STYLE : null,
      ]}
    >
      {children}
    </Pressable>
  )
}

const CARD_PADDING = {
  md: 'p-3',
  lg: 'p-5',
  xl: 'p-6',
} as const

const CARD_GAP = {
  sm: 'gap-1',
  md: 'gap-3',
  lg: 'gap-4',
} as const

export function AppCard({
  children,
  padding = 'md',
  gap = 'md',
  className = '',
  onPress,
  accessibilityLabel,
}: {
  children: ReactNode
  padding?: keyof typeof CARD_PADDING
  gap?: keyof typeof CARD_GAP
  className?: string
  onPress?: () => void
  accessibilityLabel?: string
}) {
  const classes = `${CARD_SURFACE} ${CARD_GAP[gap]} ${CARD_PADDING[padding]} ${className}`

  if (!onPress) {
    return <View className={classes}>{children}</View>
  }

  return (
    <AppPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hoverClassName="border-primary/40"
      className={classes}
    >
      {children}
    </AppPressable>
  )
}

export function ListGroup({
  title,
  fill = false,
  bordered = true,
  children,
}: {
  title?: string
  fill?: boolean
  /** La superficie con borde la ponen las filas: una lista más corta que la
   *  pantalla dejaba el borde dibujando un alto vacío debajo del último dato. */
  bordered?: boolean
  children: ReactNode
}) {
  return (
    <View className={`gap-2 ${fill ? 'flex-1' : ''}`}>
      {title ? <SectionLabel>{title}</SectionLabel> : null}
      <View
        className={`overflow-hidden ${fill ? 'flex-1' : ''} ${
          bordered ? CARD_SURFACE : ''
        }`}
      >
        {children}
      </View>
    </View>
  )
}

export function ListRow({
  children,
  last = false,
  className = '',
}: {
  children: ReactNode
  last?: boolean
  className?: string
}) {
  return (
    <View
      className={`min-h-14 flex-row items-center justify-between gap-3 border-border px-4 py-3 ${
        last ? '' : 'border-b'
      } ${className}`}
    >
      {children}
    </View>
  )
}

export function FormError({
  message,
  nativeID,
  className = '',
}: {
  message: string | null
  nativeID?: string
  className?: string
}) {
  const reduceMotion = useReduceMotion()
  if (!message) return null
  return (
    <Animated.Text
      entering={enterFade(reduceMotion)}
      nativeID={nativeID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className={`text-sm text-destructive ${className}`}
    >
      {message}
    </Animated.Text>
  )
}

export function SuccessNote({ message }: { message: string | null }) {
  const reduceMotion = useReduceMotion()
  if (!message) return null
  return (
    <Animated.View
      entering={enterFade(reduceMotion)}
      className="rounded-lg bg-tint-success px-3 py-2"
    >
      <Text
        accessibilityLiveRegion="polite"
        className="text-sm font-medium text-success"
      >
        {message}
      </Text>
    </Animated.View>
  )
}

export function EmptyState({
  message,
  action,
}: {
  message: string
  action?: ReactNode
}) {
  return (
    <View className="flex-1 items-center justify-center gap-3 p-6">
      <Text className="text-center text-base text-muted-foreground">
        {message}
      </Text>
      {action}
    </View>
  )
}

export function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator
        size="large"
        accessibilityRole="progressbar"
        accessibilityLabel="Cargando"
      />
    </View>
  )
}

export function ErrorState({
  message,
  onRetry,
  retrying = false,
  centered = false,
}: {
  message: string | null
  onRetry?: () => void
  retrying?: boolean
  centered?: boolean
}) {
  return (
    <View
      className={`items-center gap-3 py-8 ${centered ? 'flex-1 justify-center' : ''}`}
    >
      <FormError message={message} />
      {onRetry ? (
        <AppButton onPress={onRetry} loading={retrying}>
          Reintentar
        </AppButton>
      ) : null}
    </View>
  )
}

export function Metric({
  label,
  value,
  tone = 'text-foreground',
  onPress,
  actionLabel,
}: {
  label: string
  value: string
  tone?: string
  /** Convierte el número en la puerta de la lista que lo explica. */
  onPress?: () => void
  actionLabel?: string
}) {
  const colors = useThemeColors()
  const body = (
    <>
      <View className="flex-row items-start justify-between gap-2">
        <Text className="flex-1 text-sm text-muted-foreground">{label}</Text>
        {onPress ? (
          <ChevronRight size={16} color={colors.mutedText} />
        ) : null}
      </View>
      <Text style={NUMERIC} className={`text-2xl font-bold ${tone}`}>
        {value}
      </Text>
    </>
  )

  if (!onPress) {
    return (
      <View className={`min-w-[150px] flex-1 gap-1 ${CARD_SURFACE} p-4`}>
        {body}
      </View>
    )
  }

  return (
    <AppPressable
      className={`min-w-[150px] flex-1 gap-1 ${CARD_SURFACE} p-4`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={actionLabel ?? label}
    >
      {body}
    </AppPressable>
  )
}
