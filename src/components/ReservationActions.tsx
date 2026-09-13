import { useState } from 'react'
import { Linking, Pressable, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Check } from 'lucide-react-native'
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
  const hasProof = Boolean(payment.proof_url && isImageUrl(payment.proof_url))
  return (
    <View className="gap-1">
      <Text className="text-muted-foreground">
        Pago: {PAYMENT_METHOD_LABELS[payment.method]} ·{' '}
        {PAYMENT_STATUS_LABELS[payment.status]}
      </Text>
      {hasProof ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Ver comprobante del pago"
          onPress={openProof}
          className="min-h-11 justify-center self-start"
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
          variant="outline"
          onPress={() => setConfirming(true)}
          loading={cancel.isPending}
        >
          Cancelar reserva
        </AppButton>
      ) : (
        <View className="gap-2">
          <Text
            accessibilityLiveRegion="polite"
            className="text-muted-foreground"
          >
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
                  onError: () => {
                    Haptics.notificationAsync(
                      Haptics.NotificationFeedbackType.Error
                    )
                  },
                })
              }
              loading={cancel.isPending}
            >
              Sí, cancelar
            </AppButton>
            <AppButton variant="ghost" onPress={() => setConfirming(false)}>
              Volver
            </AppButton>
          </View>
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
        onError: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        },
      }
    )
  }

  return (
    <View className="gap-2">
      {!open ? (
        <AppButton onPress={() => setOpen(true)} loading={pay.isPending}>
          Pagar
        </AppButton>
      ) : (
        <View className="gap-2">
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="Método de pago"
            className="flex-row gap-2"
          >
            {PAYMENT_METHODS.map((m) => {
              const selected = method === m
              return (
                <Pressable
                  key={m}
                  accessibilityRole="radio"
                  aria-checked={selected}
                  accessibilityState={{ checked: selected }}
                  onPress={() => setMethod(m)}
                  className={`min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-lg border px-3 py-2 ${
                    selected
                      ? 'border-primary bg-primary'
                      : 'border-border bg-card'
                  }`}
                  style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
                >
                  {selected ? <Check size={16} color="#FFFFFF" /> : null}
                  <Text
                    className={
                      selected
                        ? 'text-primary-foreground'
                        : 'text-foreground'
                    }
                  >
                    {PAYMENT_METHOD_LABELS[m]}
                  </Text>
                </Pressable>
              )
            })}
          </View>
          <ImageUploadField
            label="Comprobante"
            value={proofUrl}
            onUploaded={setProofUrl}
          />
          <AppInput
            label="o pega la URL"
            placeholder="URL del comprobante (opcional)"
            autoComplete="url"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={submit}
            value={proofUrl}
            onChangeText={setProofUrl}
          />
          <FormError message={clientError ?? payError} />
          <View className="flex-row items-center gap-2">
            <AppButton onPress={submit} loading={pay.isPending}>
              Registrar pago
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
