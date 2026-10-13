import { useState } from 'react'
import { Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import {
  useAcceptReservation,
  useCancelReservation,
  useRejectReservation,
} from '@/hooks/useReservations'
import {
  useAdminConfirmReservation,
  useAdminRequestCorrection,
} from '@/hooks/useAdmin'
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

// El vendedor decide sobre la solicitud sin exigir un pago: el pago se
// valida después, en la confirmación del administrador.
export function canDecideReservation(reservation: Reservation) {
  return reservation.status === 'pending'
}

export function AcceptReservationBlock({
  reservation,
  onAccepted,
}: {
  reservation: Reservation
  onAccepted?: (reservation: Reservation) => void
}) {
  const accept = useAcceptReservation()

  if (!canDecideReservation(reservation)) return null

  return (
    <ConfirmAction
      label="Aceptar reserva"
      title="Aceptar reserva"
      message={`¿Aceptar la solicitud de ${reservation.car.name}? El pago queda pendiente de validación por la plataforma.`}
      confirmLabel="Aceptar reserva"
      errorFallback="Error al aceptar la reserva"
      action={() => accept.mutateAsync(reservation.id)}
      onDone={() => onAccepted?.(reservation)}
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

  if (!canDecideReservation(reservation)) return null

  return (
    <ConfirmAction
      label="Rechazar reserva"
      variant="destructive-outline"
      title="Rechazar reserva"
      message={`¿Rechazar la solicitud de ${reservation.car.name}? Se liberan las fechas y el comprador tendrá que reservar de nuevo.`}
      confirmLabel="Rechazar reserva"
      destructive
      errorFallback="Error al rechazar la reserva"
      action={() => reject.mutateAsync(reservation.id)}
      onDone={() => onRejected?.(reservation)}
    />
  )
}

// El comprador registra el pago con la reserva pendiente o aceptada. Si el
// administrador rechazó el comprobante, la reserva sigue aceptada y se vuelve
// a enviar: la API responde 200 y el pago regresa a pendiente.
function canRecordPayment(reservation: Reservation) {
  if (reservation.status === 'pending') return !reservation.payment
  if (reservation.status === 'accepted')
    return !reservation.payment || reservation.payment.status === 'rejected'
  return false
}

function isPaymentCorrection(reservation: Reservation) {
  return (
    reservation.status === 'accepted' &&
    reservation.payment?.status === 'rejected'
  )
}

// El administrador valida el pago de una reserva ya aceptada: la única vía
// para que llegue a confirmada, o para devolver el comprobante al comprador.
export function AdminConfirmReservationBlock({
  reservationId,
  carName,
  onDone,
}: {
  reservationId: number
  carName?: string
  onDone?: (reservation: Reservation) => void
}) {
  const confirm = useAdminConfirmReservation()
  const name = carName ?? 'el auto'

  return (
    <ConfirmAction
      label="Confirmar pago"
      title="Confirmar pago"
      message={`¿Confirmar el pago de ${name}? La reserva queda confirmada.`}
      confirmLabel="Confirmar pago"
      errorFallback="Error al confirmar el pago"
      action={() => confirm.mutateAsync(reservationId)}
      onDone={onDone}
    />
  )
}

export function AdminRequestCorrectionBlock({
  reservationId,
  carName,
  onDone,
}: {
  reservationId: number
  carName?: string
  onDone?: (reservation: Reservation) => void
}) {
  const correction = useAdminRequestCorrection()
  const name = carName ?? 'el auto'

  return (
    <ConfirmAction
      label="Pedir corrección"
      variant="destructive-outline"
      title="Pedir corrección"
      message={`¿Pedir al comprador un comprobante nuevo para ${name}? La reserva sigue aceptada y el comprobante actual queda rechazado.`}
      confirmLabel="Pedir corrección"
      destructive
      errorFallback="Error al pedir la corrección"
      action={() => correction.mutateAsync(reservationId)}
      onDone={onDone}
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
  const correction = isPaymentCorrection(reservation)
  const payError = pay.isError
    ? getApiErrorMessage(pay.error, 'Error al registrar el pago')
    : null

  if (!canRecordPayment(reservation)) return null

  const title = correction ? 'Corregir comprobante' : 'Registrar pago'

  const openSheet = () => {
    setMethod(reservation.payment?.method ?? 'pos')
    setProofUrl('')
    setProofError(null)
    setOpen(true)
  }

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
      <AppButton onPress={openSheet}>{title}</AppButton>
      <ModalSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={title}
        maxWidth={DIALOG_WIDTH}
      >
        {correction ? (
          <Text className="text-sm text-muted-foreground">
            El administrador rechazó el comprobante: adjunta uno nuevo para que
            la reserva se pueda confirmar.
          </Text>
        ) : null}
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
          {correction ? 'Enviar comprobante' : 'Registrar pago'}
        </AppButton>
      </ModalSheet>
    </>
  )
}
