import { useState } from 'react'
import { Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import {
  useCancelReservation,
  useConfirmReservation,
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
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ModalSheet } from '@/components/ModalSheet'
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
      <Text className="text-muted-foreground">
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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [done, setDone] = useState(false)
  const cancelError = cancel.isError
    ? getApiErrorMessage(cancel.error, 'Error al cancelar la reserva')
    : null

  if (reservation.status !== 'pending' || reservation.payment || done)
    return null

  return (
    <>
      <AppButton variant="outline" onPress={() => setConfirmOpen(true)}>
        Cancelar reserva
      </AppButton>
      <ConfirmDialog
        visible={confirmOpen}
        title="Cancelar reserva"
        message={`¿Cancelar la reserva de ${reservation.car.name}?`}
        confirmLabel="Cancelar reserva"
        destructive
        loading={cancel.isPending}
        error={cancelError}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() =>
          cancel.mutate(reservation.id, {
            onSuccess: () => {
              setConfirmOpen(false)
              setDone(true)
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              )
            },
            onError: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            },
          })
        }
      />
    </>
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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const confirmError = confirm.isError
    ? getApiErrorMessage(confirm.error, 'Error al confirmar la reserva')
    : null

  if (!canConfirmReservation(reservation)) return null

  return (
    <>
      <AppButton
        onPress={() => setConfirmOpen(true)}
        loading={confirm.isPending}
      >
        Confirmar reserva
      </AppButton>
      <ConfirmDialog
        visible={confirmOpen}
        title="Confirmar reserva"
        message={`¿Confirmar la reserva de ${reservation.car.name}? Se aprueba el pago registrado.`}
        confirmLabel="Confirmar reserva"
        loading={confirm.isPending}
        error={confirmError}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() =>
          confirm.mutate(reservation.id, {
            onSuccess: () => {
              setConfirmOpen(false)
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              )
              onConfirmed?.(reservation)
            },
            onError: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            },
          })
        }
      />
    </>
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
        maxWidth={440}
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
