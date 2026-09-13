import { useState } from 'react'
import { Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useAuthStore } from '@/stores/auth.store'
import { API_URL } from '@/constants/config'
import { getApiErrorMessage } from '@/utils/errors'
import { AppButton, FormError } from '@/components/ui-kit'

export function ImageUploadField({
  label,
  value,
  onUploaded,
}: {
  label: string
  value: string
  onUploaded: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pick = async () => {
    setError(null)
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setError('Habilita el acceso a tus fotos para subir la imagen')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    })
    if (result.canceled || !result.assets[0]) return
    const asset = result.assets[0]
    const fileName = asset.fileName ?? 'foto.jpg'
    const mimeType = asset.mimeType ?? 'image/jpeg'
    if (!mimeType.startsWith('image/')) {
      setError('Solo se permiten imágenes JPG, PNG o WebP')
      return
    }
    setUploading(true)
    try {
      const form = new FormData()
      if (asset.file) {
        form.append('file', asset.file, fileName)
      } else {
        form.append('file', {
          uri: asset.uri,
          name: fileName,
          type: mimeType,
        } as unknown as Blob)
      }
      const token = useAuthStore.getState().token
      const res = await fetch(`${API_URL}/uploads`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      })
      const body = (await res.json().catch(() => null)) as {
        url?: string
        error?: string
      } | null
      if (!res.ok || !body?.url) {
        setError(
          getApiErrorMessage(
            { isAxiosError: true, response: { data: body } },
            'No se pudo subir la imagen'
          )
        )
        return
      }
      onUploaded(body.url)
    } catch {
      setError('No se pudo subir la imagen, reintenta')
    } finally {
      setUploading(false)
    }
  }

  return (
    <View className="gap-1">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <View className="flex-row items-center gap-2">
        <AppButton onPress={pick} loading={uploading}>
          {value ? 'Cambiar foto' : 'Subir foto'}
        </AppButton>
        {value ? (
          <Text className="flex-1 text-sm text-muted-foreground">
            Foto lista
          </Text>
        ) : null}
      </View>
      <Text className="text-sm text-muted-foreground">
        JPG, PNG o WebP, hasta 5 MB
      </Text>
      <FormError message={error} />
      {uploading ? (
        <Text
          accessibilityLiveRegion="polite"
          className="text-sm text-muted-foreground"
        >
          Subiendo imagen
        </Text>
      ) : null}
    </View>
  )
}
