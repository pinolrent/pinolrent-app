import { useState } from 'react'
import { View } from 'react-native'
import { AppButton, FormError } from '@/components/ui-kit'
import { AppInput } from '@/components/fields'
import { ImageUploadField } from '@/components/ImageUploadField'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { isImageUrl } from '@/utils/errors'

export interface SellerCarFormValues {
  name: string
  photo_url?: string
  price_per_day?: number
}

export function SellerCarForm({
  initialName = '',
  initialPhotoUrl = '',
  initialPriceCents,
  submitLabel,
  loading = false,
  error = null,
  onDirty,
  onSubmit,
  onCancel,
}: {
  initialName?: string
  initialPhotoUrl?: string
  initialPriceCents?: number
  submitLabel: string
  loading?: boolean
  error?: string | null
  onDirty?: () => void
  onSubmit: (values: SellerCarFormValues) => void
  onCancel: () => void
}) {
  const { isPhone } = useBreakpoints()
  const [name, setName] = useState(initialName)
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl)
  const [priceText, setPriceText] = useState(
    initialPriceCents === undefined ? '' : String(initialPriceCents / 100)
  )
  const [nameError, setNameError] = useState<string | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)

  const touch = () => {
    onDirty?.()
  }

  const submit = () => {
    const trimmedName = name.trim()
    const trimmedPhoto = photoUrl.trim()
    setNameError(null)
    setPriceError(null)
    setPhotoError(null)
    if (!trimmedName) {
      setNameError('El nombre es obligatorio')
      return
    }
    if (trimmedName.length > 200) {
      setNameError('El nombre no puede superar los 200 caracteres')
      return
    }
    if (trimmedPhoto.length > 0) {
      if (trimmedPhoto.length > 2048) {
        setPhotoError('La URL de la foto es demasiado larga')
        return
      }
      if (!isImageUrl(trimmedPhoto)) {
        setPhotoError('Sube una foto o pega una URL válida')
        return
      }
    }
    let price: number | undefined
    if (priceText.trim().length > 0) {
      const dollars = Number(priceText.trim().replace(',', '.'))
      if (!Number.isFinite(dollars) || dollars < 0 || dollars > 1_000_000) {
        setPriceError('Ingresa un precio en dólares de hasta 1.000.000')
        return
      }
      price = Math.round(dollars * 100)
    }
    onSubmit({
      name: trimmedName,
      ...(trimmedPhoto ? { photo_url: trimmedPhoto } : {}),
      ...(price !== undefined ? { price_per_day: price } : {}),
    })
  }

  return (
    <>
      <View className={isPhone ? 'gap-3' : 'flex-row gap-3'}>
        <View className="flex-1">
          <AppInput
            label="Nombre"
            placeholder="Ej. Toyota Corolla 2020"
            value={name}
            onChangeText={(v) => {
              setName(v)
              setNameError(null)
              touch()
            }}
            error={nameError}
          />
        </View>
        <View className={isPhone ? '' : 'w-56'}>
          <AppInput
            label="Precio por día (USD)"
            placeholder="Ej. 45.00"
            keyboardType="decimal-pad"
            value={priceText}
            onChangeText={(v) => {
              setPriceText(v)
              setPriceError(null)
              touch()
            }}
            error={priceError}
          />
        </View>
      </View>
      <ImageUploadField
        label="Foto"
        cropAspect={4 / 3}
        value={photoUrl}
        onUploaded={(url) => {
          setPhotoUrl(url)
          setPhotoError(null)
          touch()
        }}
      />
      <AppInput
        label="URL de la foto"
        placeholder="https://... o /uploads/..."
        autoCapitalize="none"
        autoCorrect={false}
        value={photoUrl}
        onChangeText={(v) => {
          setPhotoUrl(v)
          setPhotoError(null)
          touch()
        }}
        error={photoError}
      />
      <FormError message={error} />
      <View className="flex-row items-center gap-3">
        <AppButton onPress={submit} loading={loading}>
          {submitLabel}
        </AppButton>
        <AppButton variant="ghost" onPress={onCancel}>
          Cancelar
        </AppButton>
      </View>
    </>
  )
}
