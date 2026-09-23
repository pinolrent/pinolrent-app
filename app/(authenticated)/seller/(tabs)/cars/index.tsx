import { useState } from 'react'
import { View, FlatList, RefreshControl } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useCreateSellerCar, useSellerCars } from '@/hooks/useSellerCars'
import { useTransientNotice } from '@/hooks/useTransientNotice'
import type { Car } from '@/types/car'
import { getApiErrorMessage, isImageUrl } from '@/utils/errors'
import { StaggerCard } from '@/components/StaggerCard'
import { ScreenShell } from '@/components/ScreenShell'
import { CarCard } from '@/components/rows'
import { ImageUploadField } from '@/components/ImageUploadField'
import { SkeletonList } from '@/components/Skeleton'
import { ModalSheet } from '@/components/ModalSheet'
import {
  AppButton,
  EmptyState,
  ErrorState,
  FormError,
  SuccessNote,
} from '@/components/ui-kit'
import { AppInput, StatusBadge } from '@/components/fields'
import { useBreakpoints } from '@/hooks/useBreakpoints'

export default function SellerCarsScreen() {
  const router = useRouter()
  const { columns: numColumns, isPhone, isDesktop } = useBreakpoints()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useSellerCars()
  const createCar = useCreateSellerCar()

  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [priceText, setPriceText] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [notice, setNotice] = useTransientNotice()

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar tus autos')
    : null

  const createError = createCar.isError
    ? getApiErrorMessage(createCar.error, 'Error al crear el auto')
    : null

  const openForm = () => {
    setNameError(null)
    setPriceError(null)
    setPhotoError(null)
    createCar.reset()
    setNotice(null)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setName('')
    setPhotoUrl('')
    setPriceText('')
    setNameError(null)
    setPriceError(null)
    setPhotoError(null)
    createCar.reset()
  }

  const onSubmit = () => {
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
    createCar.mutate(
      {
        name: trimmedName,
        ...(trimmedPhoto ? { photo_url: trimmedPhoto } : {}),
        ...(price !== undefined ? { price_per_day: price } : {}),
      },
      {
        onSuccess: () => {
          closeForm()
          setNotice(`${trimmedName} publicado`)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        },
        onError: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        },
      }
    )
  }

  const cars = data ?? []
  const activeCount = cars.filter((car) => car.active).length

  const renderItem = ({ item, index }: { item: Car; index: number }) => (
    <StaggerCard index={index}>
      <CarCard
        car={item}
        onPress={() => router.push(`/(authenticated)/seller/cars/${item.id}`)}
        footer={
          <View className="flex-row">
            <StatusBadge tone={item.active ? 'success' : 'muted'}>
              {item.active ? 'Activo' : 'Inactivo'}
            </StatusBadge>
          </View>
        }
      />
    </StaggerCard>
  )

  return (
    <ScreenShell
      title="Mis autos"
      subtitle={`${cars.length} ${cars.length === 1 ? 'publicado' : 'publicados'} · ${activeCount} ${activeCount === 1 ? 'activo' : 'activos'}`}
      action={
        isDesktop ? (
          <AppButton onPress={openForm}>Publicar auto</AppButton>
        ) : undefined
      }
    >
      {isLoading ? (
        <SkeletonList count={4} />
      ) : isError ? (
        <ErrorState
          message={errorMessage}
          onRetry={() => refetch()}
          retrying={isRefetching}
          centered
        />
      ) : (
        <>
          <SuccessNote message={notice} />
          <FlatList
            key={numColumns}
            numColumns={numColumns}
            columnWrapperStyle={numColumns > 1 ? { gap: 12 } : undefined}
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, gap: 12, paddingBottom: 16 }}
            data={cars}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => refetch()}
              />
            }
            ListEmptyComponent={
              <EmptyState
                message="Todavía no publicaste autos"
                action={
                  isPhone ? undefined : (
                    <AppButton onPress={openForm}>Publicar auto</AppButton>
                  )
                }
              />
            }
          />
          {isPhone && (
            <View className="pt-1">
              <AppButton onPress={openForm}>Publicar auto</AppButton>
            </View>
          )}
        </>
      )}
      <ModalSheet
        visible={formOpen}
        onClose={closeForm}
        title="Nuevo auto"
        maxWidth={520}
        busy={createCar.isPending}
      >
        <View className={isPhone ? 'gap-3' : 'flex-row gap-3'}>
          <View className="flex-1">
            <AppInput
              label="Nombre"
              placeholder="Ej. Toyota Corolla 2020"
              value={name}
              onChangeText={(v) => {
                setName(v)
                setNameError(null)
                if (createCar.isError) createCar.reset()
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
                if (createCar.isError) createCar.reset()
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
            if (createCar.isError) createCar.reset()
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
            if (createCar.isError) createCar.reset()
          }}
          error={photoError}
        />
        <FormError message={createError} />
        <View className="flex-row items-center gap-3">
          <AppButton onPress={onSubmit} loading={createCar.isPending}>
            Publicar auto
          </AppButton>
          <AppButton variant="ghost" onPress={closeForm}>
            Cancelar
          </AppButton>
        </View>
      </ModalSheet>
    </ScreenShell>
  )
}
