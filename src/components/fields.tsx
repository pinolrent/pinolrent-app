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
      <Input className="rounded-lg border-border bg-card">
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
  tone: 'warning' | 'success' | 'muted'
  children: ReactNode
}) {
  const tones = {
    warning: 'bg-warning/15 text-warning',
    success: 'bg-success/15 text-success',
    muted: 'bg-muted text-muted-foreground',
  } as const
  return (
    <View className="rounded-full px-2 py-0.5">
      <Text className={`text-xs font-semibold ${tones[tone]}`}>{children}</Text>
    </View>
  )
}
