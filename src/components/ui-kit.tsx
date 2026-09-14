import type { ComponentProps, ReactNode } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { Button, ButtonSpinner, ButtonText } from '../../components/ui/button'

type Variant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'

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

export function AppCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <View className={`gap-3 rounded-xl border border-border bg-card p-3 shadow-sm ${className}`}>

      {children}
    </View>
  )
}

export function StatCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <View className="flex-1 rounded-xl border border-border bg-card p-3 shadow-sm">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-lg font-bold text-foreground">{value}</Text>
    </View>
  )
}

export function ListGroup({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <View className="gap-2">
      {title ? (
        <Text className="px-1 text-xs font-semibold uppercase text-muted-foreground">
          {title}
        </Text>
      ) : null}
      <View className="overflow-hidden rounded-xl border border-border bg-card">
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
}: {
  message: string | null
  onRetry?: () => void
  retrying?: boolean
}) {
  return (
    <View className="items-center gap-3 py-8">
      <FormError message={message} />
      {onRetry ? (
        <AppButton onPress={onRetry} loading={retrying}>
          Reintentar
        </AppButton>
      ) : null}
    </View>
  )
}
