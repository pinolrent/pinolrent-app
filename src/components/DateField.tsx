import { useState } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker'
import { formatDate, toISO } from '@/utils/dates'
import { AppInput } from './fields'
import { FormError } from './ui-kit'

function parseValue(value: string, fallback: Date): Date {
  const d = new Date(`${value}T00:00:00`)
  return Number.isNaN(d.getTime()) ? fallback : d
}

export function DateField({
  label,
  value,
  onChange,
  error,
  minimumDate,
  maximumDate,
}: {
  label: string
  value: string
  onChange: (iso: string) => void
  error?: string | null
  minimumDate?: Date
  maximumDate?: Date
}) {
  const [open, setOpen] = useState(false)
  const today = new Date()
  const selected = value ? parseValue(value, today) : today

  if (Platform.OS === 'web') {
    return (
      <AppInput
        label={label}
        placeholder="YYYY-MM-DD"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={10}
        value={value}
        onChangeText={onChange}
        error={error}
      />
    )
  }

  const onPick = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setOpen(false)
    if (event.type === 'dismissed' || !date) {
      if (Platform.OS === 'ios') setOpen(false)
      return
    }
    onChange(toISO(date))
    if (Platform.OS === 'ios') setOpen(false)
  }

  return (
    <View className="gap-1">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setOpen(true)}
        className="min-h-11 justify-center rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm"
        style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
      >
        <Text className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value ? formatDate(value) : 'Seleccionar fecha'}
        </Text>
      </Pressable>
      {open && (
        <DateTimePicker
          value={selected}
          mode="date"
          display="default"
          onChange={onPick}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
      <FormError message={error ?? null} />
    </View>
  )
}
