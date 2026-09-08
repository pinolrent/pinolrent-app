import type { ComponentProps, ReactNode } from 'react'
import { Text, View } from 'react-native'
import { Button, ButtonText } from '../../components/ui/button'

type Variant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'

export function AppButton({
  children,
  variant = 'default',
  ...props
}: {
  children: ReactNode
  variant?: Variant
} & Omit<ComponentProps<typeof Button>, 'variant' | 'children'>) {
  return (
    <Button variant={variant} {...props}>
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
    <View className={`rounded-xl border border-border bg-card p-3 ${className}`}>
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
    <View className="flex-1 rounded-xl border border-border bg-card p-3">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-lg font-bold text-foreground">{value}</Text>
    </View>
  )
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return <Text className="text-sm text-destructive">{message}</Text>
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
