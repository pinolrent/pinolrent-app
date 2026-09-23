import { useState } from 'react'
import { Platform, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '@/services/api'
import { getApiErrorMessage } from '@/utils/errors'
import { AppButton, FormError } from '@/components/ui-kit'
import { CropImageModal } from '@/components/CropImageModal'

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export function ImageUploadField({
  label,
  value,
  onUploaded,
  cropAspect,
}: {
  label: string
  value: string
  onUploaded: (url: string) => void
  cropAspect?: number
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingCrop, setPendingCrop] = useState<{
    uri: string
    width: number
    height: number
  } | null>(null)

  const upload = async (source: {
    uri: string
    name: string
    type: string
    file?: File
  }) => {
    setUploading(true)
    try {
      const form = new FormData()
      if (source.file) {
        form.append('file', source.file, source.name)
      } else {
        form.append('file', {
          uri: source.uri,
          name: source.name,
          type: source.type,
        } as unknown as Blob)
      }
      const res = await api.post<{ url: string }>('/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = res.data?.url
      if (!url) {
        setError('Error al subir la imagen')
        return
      }
      onUploaded(url)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error al subir la imagen'))
    } finally {
      setUploading(false)
    }
  }

  const pick = async () => {
    setError(null)
    try {
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
      const size = asset.fileSize ?? asset.file?.size
      if (typeof size === 'number' && size > MAX_UPLOAD_BYTES) {
        setError('La imagen no puede superar los 5 MB')
        return
      }
      if (cropAspect) {
        setPendingCrop({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
        })
        return
      }
      await upload({
        uri: asset.uri,
        name: fileName,
        type: mimeType,
        file: asset.file ?? undefined,
      })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error al subir la imagen'))
    }
  }

  const uploadCropped = async (croppedUri: string) => {
    setPendingCrop(null)
    if (Platform.OS === 'web') {
      try {
        const blob = await (await fetch(croppedUri)).blob()
        const file = new File([blob], 'foto.jpg', {
          type: blob.type || 'image/jpeg',
        })
        await upload({
          uri: croppedUri,
          name: 'foto.jpg',
          type: 'image/jpeg',
          file,
        })
      } catch (err) {
        setError(getApiErrorMessage(err, 'Error al subir la imagen'))
      }
      return
    }
    await upload({ uri: croppedUri, name: 'foto.jpg', type: 'image/jpeg' })
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
            Imagen subida
          </Text>
        ) : null}
      </View>
      <Text className="text-sm text-muted-foreground">
        JPG, PNG o WebP, hasta 5 MB
      </Text>
      <FormError message={error} />
      {pendingCrop && cropAspect ? (
        <CropImageModal
          uri={pendingCrop.uri}
          width={pendingCrop.width}
          height={pendingCrop.height}
          aspect={cropAspect}
          onCancel={() => setPendingCrop(null)}
          onCropped={uploadCropped}
        />
      ) : null}
    </View>
  )
}
