import { useState } from 'react'
import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useCreateReservation } from '@/hooks/useReservations'
import type { Car } from '@/types/car'
import { formatPrice, formatPricePerDay } from '@/utils/currency'
import { formatDays, isValidISODate, toISO } from '@/utils/dates'
import {
  MAX_RESERVATION_NIGHTS,
  isValidReservationRange,
  reservationRangeError,
  reservationTotal,
} from '@/utils/reservations'
import { getApiErrorMessage } from '@/utils/errors'
import { AppButton, FormError } from '@/components/ui-kit'
import { DateRangeField } from '@/components/DateField'
import { ModalSheet } from '@/components/ModalSheet'

export function ReserveCarModal({
  car,
  onClose,
}: {
  car: Car
  onClose: () => void
}) {
  const router = useRouter()
  const createReservation = useCreateReservation()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [rangeError, setRangeError] = useState<string | null>(null)

  const today = toISO(new Date())
  const hasStart = isValidISODate(startDate)
  const hasEnd = isValidISODate(endDate)
  const rangeHint = reservationRangeError(startDate, endDate, today)
  const validRange = isValidReservationRange(startDate, endDate, today)
  const preview = validRange
    ? reservationTotal(startDate, endDate, car.price_per_day)
    : { days: 0, total: 0 }

  const editRange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
    setRangeError(null)
    createReservation.reset()
  }

  const submit = () => {
    setRangeError(null)
    if (!hasStart || !hasEnd) {
      setRangeError('Selecciona las fechas de inicio y fin')
      return
    }
    const rangeValidation = reservationRangeError(startDate, endDate, today)
    if (rangeValidation) {
      setRangeError(rangeValidation)
      return
    }
    createReservation.mutate(
      { car_id: car.id, start_date: startDate, end_date: endDate },
      {
        onSuccess: (res) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          onClose()
          router.replace(
            `/(authenticated)/(buyer)/reservations?created=${res.id}`
          )
        },
        onError: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        },
      }
    )
  }

  const serverError = createReservation.isError
    ? getApiErrorMessage(createReservation.error, 'Error al crear la reserva')
    : null

  return (
    <ModalSheet visible onClose={onClose} title="Reservar" maxWidth={440}>
      <Text className="text-base font-semibold text-foreground">
        {car.name} · {formatPricePerDay(car.price_per_day)}
      </Text>
      <DateRangeField
        label="Fechas de la reserva"
        startDate={startDate}
        endDate={endDate}
        onChange={editRange}
        error={rangeError ?? rangeHint}
        minimumDate={new Date()}
        maxNights={MAX_RESERVATION_NIGHTS}
      />
      <FormError message={serverError} />
      {validRange && (
        <View className="flex-row items-center justify-between gap-3 border-t border-border pt-3">
          <Text className="text-sm text-muted-foreground">
            {formatDays(preview.days)}
          </Text>
          <Text className="text-lg font-bold text-foreground">
            {formatPrice(preview.total)}
          </Text>
        </View>
      )}
      <AppButton onPress={submit} loading={createReservation.isPending}>
        Reservar
      </AppButton>
    </ModalSheet>
  )
}
