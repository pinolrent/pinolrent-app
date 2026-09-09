import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { Input, InputField } from '../../components/ui/input'
import { FormError } from './ui-kit'

export function AppInput({
  label,
  error,
  ...props
}: {
  label: string
  error?: string | null
} & React.ComponentProps<typeof InputField>) {
  return (
    <View className="gap-1">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Input className="rounded-lg border border-border bg-card shadow-sm">
        <InputField
          accessibilityLabel={label}
          placeholderTextColor="#64748B"
          className="text-foreground"
          {...props}
        />
      </Input>
      <FormError message={error ?? null} />
    </View>
  )
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: 'warning' | 'success' | 'muted' | 'destructive'
  children: ReactNode
}) {
  const tones = {
    warning: 'bg-tint-warning text-warning',
    success: 'bg-tint-success text-success',
    muted: 'bg-muted text-muted-foreground',
    destructive: 'bg-tint-destructive text-destructive',
  } as const
  return (
    <View className="rounded-full px-2 py-0.5">
      <Text className={`text-xs font-semibold ${tones[tone]}`}>{children}</Text>
    </View>
  )
}
