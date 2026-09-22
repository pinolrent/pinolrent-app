import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { formatDate, formatDateRange, isValidISODate } from '@/utils/dates'
import { RangeDateSheet, SingleDateSheet } from './CalendarSheet'
import { FormError } from './ui-kit'

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

  return (
    <View className="gap-1">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={value ? `${label}: ${formatDate(value)}` : label}
        accessibilityHint="Abre el calendario"
        onPress={() => setOpen(true)}
        className="min-h-11 justify-center rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm"
        style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
      >
        <Text className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value ? formatDate(value) : 'Seleccionar fecha'}
        </Text>
      </Pressable>
      <SingleDateSheet
        visible={open}
        title={label}
        value={value}
        minDate={minimumDate}
        maxDate={maximumDate}
        onSelect={onChange}
        onClose={() => setOpen(false)}
      />
      <FormError message={error ?? null} />
    </View>
  )
}

export function DateRangeField({
  label,
  startDate,
  endDate,
  onChange,
  error,
  minimumDate,
  maxNights,
}: {
  label: string
  startDate: string
  endDate: string
  onChange: (startISO: string, endISO: string) => void
  error?: string | null
  minimumDate?: Date
  maxNights?: number
}) {
  const [open, setOpen] = useState(false)
  const hasStart = isValidISODate(startDate)
  const hasEnd = isValidISODate(endDate)
  const summary = hasStart
    ? hasEnd
      ? formatDateRange(startDate, endDate)
      : `${formatDate(startDate)} → …`
    : 'Seleccionar fechas'

  return (
    <View className="gap-1">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={hasStart ? `${label}: ${summary}` : label}
        accessibilityHint="Abre el calendario para elegir inicio y fin"
        onPress={() => setOpen(true)}
        className="min-h-11 justify-center rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm"
        style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
      >
        <Text
          className={hasStart ? 'text-foreground' : 'text-muted-foreground'}
        >
          {summary}
        </Text>
      </Pressable>
      <RangeDateSheet
        visible={open}
        title={label}
        startDate={startDate}
        endDate={endDate}
        minDate={minimumDate}
        maxNights={maxNights}
        onSelect={onChange}
        onClose={() => setOpen(false)}
      />
      <FormError message={error ?? null} />
    </View>
  )
}
