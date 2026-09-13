import { forwardRef, useId, type ReactNode } from 'react'
import { Text, View, type TextInput } from 'react-native'
import { Input, InputField } from '../../components/ui/input'
import { useThemeStore } from '@/stores/theme.store'
import { FormError } from './ui-kit'

export const AppInput = forwardRef<
  TextInput,
  {
    label: string
    error?: string | null
  } & React.ComponentProps<typeof InputField>
>(function AppInput({ label, error, ...props }, ref) {
  const theme = useThemeStore((s) => s.theme)
  const errorId = useId()
  return (
    <View className="gap-1">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Input
        className="rounded-lg border border-border bg-card shadow-sm"
        isInvalid={Boolean(error)}
      >
        <InputField
          ref={ref as React.ComponentProps<typeof InputField>['ref']}
          aria-label={label}
          aria-describedby={error ? errorId : undefined}
          accessibilityLabel={label}
          placeholderTextColor={theme === 'dark' ? '#94A3B8' : '#64748B'}
          className="text-foreground"
          {...props}
        />
      </Input>
      <FormError message={error ?? null} nativeID={errorId} />
    </View>
  )
})

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
