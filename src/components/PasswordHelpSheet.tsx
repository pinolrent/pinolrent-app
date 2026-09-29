import { Linking, Text } from 'react-native'
import { SUPPORT_WHATSAPP } from '@/constants/support'
import { ModalSheet } from '@/components/ModalSheet'
import { AppButton } from '@/components/ui-kit'

const MESSAGE =
  'Hola, olvidé mi contraseña de PinolRent y necesito ayuda para entrar.'

export function PasswordHelpSheet({
  visible,
  onClose,
}: {
  visible: boolean
  onClose: () => void
}) {
  const whatsapp = SUPPORT_WHATSAPP.replace(/\D/g, '')

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title="Recuperar contraseña"
    >
      <Text className="text-sm text-muted-foreground">
        Escribinos desde el correo con el que te registraste y te ayudamos a
        entrar de nuevo.
      </Text>
      {whatsapp ? (
        <AppButton
          onPress={() =>
            Linking.openURL(
              `https://wa.me/${whatsapp}?text=${encodeURIComponent(MESSAGE)}`
            )
          }
        >
          Escribir por WhatsApp
        </AppButton>
      ) : null}
      <AppButton variant="outline" onPress={onClose}>
        Entendido
      </AppButton>
    </ModalSheet>
  )
}
