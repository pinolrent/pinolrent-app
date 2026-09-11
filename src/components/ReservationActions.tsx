import { useState } from 'react'
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useCancelReservation } from '@/hooks/useReservations'
import { useCreatePayment } from '@/hooks/usePayments'
import type { Payment } from '@/types/payment'
import type { Reservation } from '@/types/reservation'
import { getApiErrorMessage, isImageUrl, resolveImageUrl } from '@/utils/errors'
import { AppButton, FormError } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'
import { ImageUploadField } from '@/components/ImageUploadField'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/constants/payment-ui'

const PAYMENT_METHODS: Payment['method'][] = ['pos', 'cash']

export function PaymentSummary({ payment }: { payment: Payment }) {
  const openProof = () => {
    const url = resolveImageUrl(payment.proof_url)
    if (url) {
      Linking.openURL(url)
    }
  }
  return (
    <View className="gap-1">
      <Text className="text-muted-foreground">
        Pago: {PAYMENT_METHOD_LABELS[payment.method]} ·{' '}
        {PAYMENT_STATUS_LABELS[payment.status]}
      </Text>
      {payment.proof_url ? (
        <Pressable
          accessibilityRole="link"
          onPress={openProof}
          disabled={!isImageUrl(payment.proof_url)}
        >
          <Text
            className="text-sm text-primary"
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            Ver comprobante
          </Text>
        </Pressable>
      ) : null}
    </View>
  )
}

export function CancelReservationBlock({ reservation }: { reservation: Reservation }) {
  const cancel = useCancelReservation()
  const [confirming, setConfirming] = useState(false)
  const cancelError = cancel.isError
    ? getApiErrorMessage(cancel.error, 'Error al cancelar la reserva')
    : null

  if (reservation.status !== 'pending' || reservation.payment) return null

  return (
    <View className="gap-2">
      {!confirming ? (
        <AppButton
          variant="destructive"
          onPress={() => setConfirming(true)}
          disabled={cancel.isPending}
        >
          Cancelar reserva
        </AppButton>
      ) : (
        <View className="gap-2">
          {cancel.isPending ? (
            <ActivityIndicator />
          ) : (
            <>
              <Text className="text-muted-foreground">
                ¿Cancelar la reserva de {reservation.car.name}?
              </Text>
              <FormError message={cancelError} />
              <View className="flex-row items-center gap-2">
                <AppButton
                  variant="destructive"
                  onPress={() =>
                    cancel.mutate(reservation.id, {
                      onSuccess: () => {
                        setConfirming(false)
                        Haptics.notificationAsync(
                          Haptics.NotificationFeedbackType.Success
                        )
                      },
                    })
                  }
                  disabled={cancel.isPending}
                >
                  Confirmar
                </AppButton>
                <AppButton variant="ghost" onPress={() => setConfirming(false)}>
                  Volver
                </AppButton>
              </View>
            </>
          )}
        </View>
      )}
    </View>
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
  const [clientError, setClientError] = useState<string | null>(null)
  const payError = pay.isError
    ? getApiErrorMessage(pay.error, 'Error al registrar el pago')
    : null

  if (reservation.status !== 'pending' || reservation.payment) return null

  const submit = () => {
    const proof = proofUrl.trim()
    if (proof.length > 0 && !isImageUrl(proof)) {
      setClientError(
        proof.length > 2048
          ? 'Comprobante demasiado largo'
          : 'Comprobante inválido: sube una foto o pega una URL válida'
      )
      return
    }
    setClientError(null)
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
      }
    )
  }

  return (
    <View className="gap-2">
      {!open ? (
        <AppButton onPress={() => setOpen(true)} disabled={pay.isPending}>
          Pagar
        </AppButton>
      ) : (
        <View className="gap-2">
          <View className="flex-row gap-2">
            {PAYMENT_METHODS.map((m) => (
              <Pressable
                key={m}
                accessibilityRole="button"
                onPress={() => setMethod(m)}
                className={`rounded-lg border px-3 py-1.5 ${
                  method === m
                    ? 'border-primary bg-primary'
                    : 'border-border bg-card'
                }`}
              >
                <Text
                  className={
                    method === m ? 'text-primary-foreground' : 'text-foreground'
                  }
                >
                  {PAYMENT_METHOD_LABELS[m]}
                </Text>
              </Pressable>
            ))}
          </View>
          <ImageUploadField
            label="Comprobante"
            value={proofUrl}
            onUploaded={setProofUrl}
          />
          <AppInput
            label="o pega la URL"
            placeholder="URL del comprobante (opcional)"
            autoCapitalize="none"
            autoCorrect={false}
            value={proofUrl}
            onChangeText={setProofUrl}
          />
          <FormError message={clientError ?? payError} />
          <View className="flex-row items-center gap-2">
            <AppButton onPress={submit} disabled={pay.isPending}>
              {pay.isPending ? <ActivityIndicator /> : 'Registrar pago'}
            </AppButton>
            <AppButton variant="ghost" onPress={() => setOpen(false)}>
              Volver
            </AppButton>
          </View>
        </View>
      )}
    </View>
  )
}
