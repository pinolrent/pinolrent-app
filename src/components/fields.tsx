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
    warning: { bg: 'bg-tint-warning', text: 'text-warning' },
    success: { bg: 'bg-tint-success', text: 'text-success' },
    muted: { bg: 'bg-muted', text: 'text-muted-foreground' },
    destructive: { bg: 'bg-tint-destructive', text: 'text-destructive' },
  } as const
  return (
    <View className={`rounded-full px-2 py-0.5 ${tones[tone].bg}`}>
      <Text className={`text-xs font-semibold ${tones[tone].text}`}>{children}</Text>
    </View>
  )
}
