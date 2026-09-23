import type { ComponentProps, ReactNode } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { Button, ButtonSpinner, ButtonText } from '../../components/ui/button'
import { useHover } from '@/hooks/useHover'

type Variant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'

export const CARD_SURFACE = 'rounded-xl border border-border bg-card shadow-sm'

export function AppButton({
  children,
  variant = 'default',
  loading = false,
  disabled,
  ...props
}: {
  children: ReactNode
  variant?: Variant
  loading?: boolean
} & Omit<ComponentProps<typeof Button>, 'variant' | 'children'>) {
  return (
    <Button
      variant={variant}
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

  return (
    <Pressable
      {...rest}
      {...(hoverClassName ? hoverProps : {})}
      className={`${className}${
        hoverClassName && hovered ? ` ${hoverClassName}` : ''
      }`}
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        state.pressed ? { opacity: 0.9 } : null,
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
}: {
  children: ReactNode
  padding?: keyof typeof CARD_PADDING
  gap?: keyof typeof CARD_GAP
  hovered?: boolean
  className?: string
}) {
  return (
    <View
      className={`rounded-xl border ${
        hovered ? 'border-primary/40' : 'border-border'
      } bg-card shadow-sm ${CARD_GAP[gap]} ${CARD_PADDING[padding]} ${className}`}
    >
      {children}
    </View>
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
      <Text className="text-center text-muted-foreground">{message}</Text>
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
