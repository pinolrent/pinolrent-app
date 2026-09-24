import type { ComponentProps, ReactNode } from 'react'
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native'
import { Button, ButtonSpinner, ButtonText } from '../../components/ui/button'
import { useHover } from '@/hooks/useHover'
import { useThemeColors } from '@/hooks/useThemeColors'

type Variant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'

export const CARD_SURFACE = 'rounded-xl border border-border bg-card shadow-sm'

const PRESSED_STYLE = { opacity: 0.7, transform: [{ scale: 0.99 }] }

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
  hovered = false,
  className = '',
  onPress,
  accessibilityLabel,
}: {
  children: ReactNode
  padding?: keyof typeof CARD_PADDING
  gap?: keyof typeof CARD_GAP
  hovered?: boolean
  className?: string
  onPress?: () => void
  accessibilityLabel?: string
}) {
  const classes = `rounded-xl border ${
    hovered ? 'border-primary/40' : 'border-border'
  } bg-card shadow-sm ${CARD_GAP[gap]} ${CARD_PADDING[padding]} ${className}`

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
  children,
}: {
  title?: string
  fill?: boolean
  children: ReactNode
}) {
  return (
    <View className={`gap-2 ${fill ? 'flex-1' : ''}`}>
      {title ? (
        <Text className="px-1 text-xs font-semibold uppercase text-muted-foreground">
          {title}
        </Text>
      ) : null}
      <View
        className={`overflow-hidden rounded-xl border border-border bg-card shadow-sm ${
          fill ? 'flex-1' : ''
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
  if (!message) return null
  return (
    <Text
      nativeID={nativeID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className={`text-sm text-destructive ${className}`}
    >
      {message}
    </Text>
  )
}

export function SuccessNote({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <View className="rounded-lg bg-tint-success px-3 py-2">
      <Text
        accessibilityLiveRegion="polite"
        className="text-sm font-medium text-success"
      >
        {message}
      </Text>
    </View>
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
