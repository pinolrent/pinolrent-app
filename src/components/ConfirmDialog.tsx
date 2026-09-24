import { Text, View } from 'react-native'
import { AppButton, FormError } from '@/components/ui-kit'
import { ModalSheet } from '@/components/ModalSheet'

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Volver',
  destructive = false,
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}: {
  visible: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <ModalSheet
      visible={visible}
      onClose={onCancel}
      title={title}
      busy={loading}
    >
      <View className="gap-4">
        <Text
          accessibilityLiveRegion="polite"
          className="text-sm text-muted-foreground"
        >
          {message}
        </Text>
        <FormError message={error} />
        <View className="flex-row flex-wrap justify-end gap-2">
          <AppButton variant="ghost" onPress={onCancel} disabled={loading}>
            {cancelLabel}
          </AppButton>
          <AppButton
            variant={destructive ? 'destructive' : 'default'}
            onPress={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </AppButton>
        </View>
      </View>
    </ModalSheet>
  )
}
