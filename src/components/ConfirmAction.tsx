import { useState, type ComponentProps } from 'react'
import * as Haptics from 'expo-haptics'
import { getApiErrorMessage } from '@/utils/errors'
import { AppButton } from '@/components/ui-kit'
import { ConfirmDialog } from '@/components/ConfirmDialog'

// Una acción que se confirma: el botón abre el diálogo, el diálogo corre la
// mutación, bloquea mientras corre y muestra el error en su lugar. El haptic
// de éxito o error va acá para que ninguna pantalla lo olvide.
export function ConfirmAction<T>({
  label,
  variant = 'default',
  title,
  message,
  confirmLabel,
  destructive = false,
  errorFallback,
  action,
  onDone,
}: {
  label: string
  variant?: ComponentProps<typeof AppButton>['variant']
  title: string
  message: string
  confirmLabel: string
  destructive?: boolean
  errorFallback: string
  action: () => Promise<T>
  onDone?: (result: T) => void
}) {
  const [open, setOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    setRunning(true)
    setError(null)
    try {
      const result = await action()
      setOpen(false)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      onDone?.(result)
    } catch (err) {
      setError(getApiErrorMessage(err, errorFallback))
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } finally {
      setRunning(false)
    }
  }

  return (
    <>
      <AppButton variant={variant} onPress={() => setOpen(true)}>
        {label}
      </AppButton>
      <ConfirmDialog
        visible={open}
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        destructive={destructive}
        loading={running}
        error={error}
        onCancel={() => {
          setOpen(false)
          setError(null)
        }}
        onConfirm={run}
      />
    </>
  )
}
