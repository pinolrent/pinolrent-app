import { useState } from 'react'
import { Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import {
  useCancelReservation,
  useConfirmReservation,
  useRejectReservation,
} from '@/hooks/useReservations'
import { useCreatePayment } from '@/hooks/usePayments'
import type { Payment } from '@/types/payment'
import type { Reservation } from '@/types/reservation'
import { getApiErrorMessage, isImageUrl } from '@/utils/errors'
import { AppButton, FormError } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'
import { ImageUploadField } from '@/components/ImageUploadField'
import { ChoiceGroup } from '@/components/ChoiceGroup'
import { ProofLink } from '@/components/ProofLink'
import { ConfirmAction } from '@/components/ConfirmAction'
import { ModalSheet } from '@/components/ModalSheet'
import { DIALOG_WIDTH } from '@/constants/layout'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/constants/payment-ui'

const PAYMENT_METHODS = [
  { value: 'pos', label: PAYMENT_METHOD_LABELS.pos },
  { value: 'cash', label: PAYMENT_METHOD_LABELS.cash },
] as const

export function PaymentSummary({ payment }: { payment: Payment }) {
  return (
    <View className="gap-1">
      <Text className="text-base text-muted-foreground">
        Pago {PAYMENT_METHOD_LABELS[payment.method]} ·{' '}
        {PAYMENT_STATUS_LABELS[payment.status]}
      </Text>
      <ProofLink url={payment.proof_url} className="self-start" />
    </View>
  )
}

export function CancelReservationBlock({
  reservation,
}: {
  reservation: Reservation
}) {
  const cancel = useCancelReservation()
  const [done, setDone] = useState(false)

  if (reservation.status !== 'pending' || reservation.payment || done)
    return null

  return (
    <ConfirmAction
      label="Cancelar reserva"
      variant="outline"
      title="Cancelar reserva"
      message={`¿Cancelar la reserva de ${reservation.car.name}?`}
      confirmLabel="Cancelar reserva"
      destructive
      errorFallback="Error al cancelar la reserva"
      action={() => cancel.mutateAsync(reservation.id)}
      onDone={() => setDone(true)}
    />
  )
}

export function canConfirmReservation(reservation: Reservation) {
  return (
    reservation.status === 'pending' &&
    reservation.payment?.status === 'pending'
  )
}

export function ConfirmReservationBlock({
  reservation,
  onConfirmed,
}: {
  reservation: Reservation
  onConfirmed?: (reservation: Reservation) => void
}) {
  const confirm = useConfirmReservation()

  if (!canConfirmReservation(reservation)) return null

  return (
    <ConfirmAction
      label="Confirmar reserva"
      title="Confirmar reserva"
      message={`¿Confirmar la reserva de ${reservation.car.name}? Se aprueba el pago registrado.`}
      confirmLabel="Confirmar reserva"
      errorFallback="Error al confirmar la reserva"
      action={() => confirm.mutateAsync(reservation.id)}
      onDone={() => onConfirmed?.(reservation)}
    />
  )
}

export function RejectReservationBlock({
  reservation,
  onRejected,
}: {
  reservation: Reservation
  onRejected?: (reservation: Reservation) => void
}) {
  const reject = useRejectReservation()

  if (!canConfirmReservation(reservation)) return null

  return (
    <ConfirmAction
      label="Rechazar reserva"
      variant="destructive-outline"
      title="Rechazar reserva"
      message={`¿Rechazar el pago de la reserva de ${reservation.car.name}? Se cancela la reserva y el comprador tendrá que reservar de nuevo.`}
      confirmLabel="Rechazar reserva"
      destructive
      errorFallback="Error al rechazar la reserva"
      action={() => reject.mutateAsync(reservation.id)}
      onDone={() => onRejected?.(reservation)}
    />
  )
}

export function PayReservationBlock({
  reservation,
  onPaid,
}: {
  reservation: Reservation
  onPaid?: () => void
}) {
  const pay = useCreatePayment()
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState<Payment['method']>('pos')
  const [proofUrl, setProofUrl] = useState('')
  const [proofError, setProofError] = useState<string | null>(null)
  const payError = pay.isError
    ? getApiErrorMessage(pay.error, 'Error al registrar el pago')
    : null

  if (reservation.status !== 'pending' || reservation.payment) return null

  const submit = () => {
    const proof = proofUrl.trim()
    if (proof.length > 0 && !isImageUrl(proof)) {
      setProofError(
        proof.length > 2048
          ? 'La URL del comprobante es demasiado larga'
          : 'Sube una foto o pega una URL válida'
      )
      return
    }
    setProofError(null)
    pay.mutate(
      {
        reservationId: reservation.id,
        data: proof ? { method, proof_url: proof } : { method },
      },
      {
        onSuccess: () => {
          setOpen(false)
          setProofUrl('')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          onPaid?.()
        },
        onError: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        },
      }
    )
  }

  return (
    <>
      <AppButton onPress={() => setOpen(true)}>Registrar pago</AppButton>
      <ModalSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Registrar pago"
        maxWidth={DIALOG_WIDTH}
      >
        <ChoiceGroup
          label="Método de pago"
          options={PAYMENT_METHODS}
          value={method}
          onChange={setMethod}
        />
        <ImageUploadField
          label="Comprobante"
          value={proofUrl}
          onUploaded={(url) => {
            setProofUrl(url)
            setProofError(null)
          }}
        />
        <AppInput
          label="URL del comprobante"
          placeholder="https://... o /uploads/..."
          autoComplete="url"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={submit}
          value={proofUrl}
          onChangeText={(v) => {
            setProofUrl(v)
            setProofError(null)
          }}
          error={proofError}
        />
        <FormError message={payError} />
        <AppButton onPress={submit} loading={pay.isPending}>
          Registrar pago
        </AppButton>
      </ModalSheet>
    </>
  )
}
