import type { ReactNode } from 'react'
import DateTimePicker, {
  type DatePickerBaseProps,
} from 'react-native-ui-datepicker'
import dayjs from 'dayjs'
import { useThemeColors } from '@/hooks/useThemeColors'
import { toISO } from '@/utils/dates'
import { ModalSheet } from './ModalSheet'

type CalendarStyles = NonNullable<DatePickerBaseProps['styles']>

function useCalendarStyles(): CalendarStyles {
  const colors = useThemeColors()
  return {
    day: { borderRadius: 8 },
    day_label: { color: colors.text },
    today: { borderWidth: 1, borderColor: colors.primary },
    today_label: { color: colors.primary },
    selected: { backgroundColor: colors.primary },
    selected_label: { color: colors.primaryForeground, fontWeight: '600' },
    outside: { opacity: 0.4 },
    outside_label: { color: colors.mutedText },
    disabled: { opacity: 0.4 },
    disabled_label: { color: colors.mutedText },
    range_fill: { backgroundColor: `${colors.primary}33` },
    range_start: {
      backgroundColor: colors.primary,
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    },
    range_end: {
      backgroundColor: colors.primary,
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    },
    range_start_label: { color: colors.primaryForeground, fontWeight: '600' },
    range_end_label: { color: colors.primaryForeground, fontWeight: '600' },
    range_middle_label: { color: colors.text },
    month_selector_label: { color: colors.text, fontWeight: '600' },
    year_selector_label: { color: colors.text },
    weekday_label: { color: colors.mutedText },
    weekdays: { borderBottomWidth: 1, borderBottomColor: colors.border },
    header: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 8,
    },
  }
}

function Sheet({
  title,
  visible,
  onClose,
  children,
}: {
  title: string
  visible: boolean
  onClose: () => void
  children: ReactNode
}) {
  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title={title}
      maxWidth={400}
    >
      {children}
    </ModalSheet>
  )
}

export function SingleDateSheet({
  visible,
  title,
  value,
  minDate,
  maxDate,
  onSelect,
  onClose,
}: {
  visible: boolean
  title: string
  value: string
  minDate?: Date
  maxDate?: Date
  onSelect: (iso: string) => void
  onClose: () => void
}) {
  const styles = useCalendarStyles()
  return (
    <Sheet title={title} visible={visible} onClose={onClose}>
      <DateTimePicker
        mode="single"
        date={value || undefined}
        minDate={minDate}
        maxDate={maxDate}
        firstDayOfWeek={1}
        locale="es"
        styles={styles}
        onChange={({ date }) => {
          if (!date) return
          onSelect(toISO(dayjs(date).toDate()))
          onClose()
        }}
      />
    </Sheet>
  )
}

export function RangeDateSheet({
  visible,
  title,
  startDate,
  endDate,
  minDate,
  maxNights,
  onSelect,
  onClose,
}: {
  visible: boolean
  title: string
  startDate: string
  endDate: string
  minDate?: Date
  maxNights?: number
  onSelect: (startISO: string, endISO: string) => void
  onClose: () => void
}) {
  const styles = useCalendarStyles()
  return (
    <Sheet title={title} visible={visible} onClose={onClose}>
      <DateTimePicker
        mode="range"
        startDate={startDate || undefined}
        endDate={endDate || undefined}
        minDate={minDate}
        max={maxNights}
        firstDayOfWeek={1}
        locale="es"
        allowRangeReset
        styles={styles}
        onChange={({ startDate: start, endDate: end }) => {
          onSelect(
            start ? toISO(dayjs(start).toDate()) : '',
            end ? toISO(dayjs(end).toDate()) : ''
          )
          if (end) onClose()
        }}
      />
    </Sheet>
  )
}
