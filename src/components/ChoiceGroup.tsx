import { Text, View } from 'react-native'
import { Check } from 'lucide-react-native'
import { useThemeColors } from '@/hooks/useThemeColors'
import { AppPressable } from '@/components/ui-kit'

export function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  className = '',
}: {
  label: string
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  const colors = useThemeColors()

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      className={`flex-row gap-2 ${className}`}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <AppPressable
            key={option.value}
            accessibilityRole="radio"
            aria-checked={selected}
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(option.value)}
            className={`min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-lg border px-3 py-2 ${
              selected ? 'border-primary bg-primary' : 'border-border bg-card'
            }`}
          >
            {selected ? (
              <Check size={16} color={colors.primaryForeground} />
            ) : null}
            <Text
              className={
                selected ? 'text-primary-foreground' : 'text-foreground'
              }
            >
              {option.label}
            </Text>
          </AppPressable>
        )
      })}
    </View>
  )
}
