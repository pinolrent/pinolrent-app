import { useState } from 'react'
import { View, Text, FlatList, RefreshControl } from 'react-native'
import * as Haptics from 'expo-haptics'
import {
  useCreateSellerCar,
  useSellerCars,
  useToggleSellerCar,
} from '@/hooks/useSellerCars'
import type { Car } from '@/types/car'
import { getApiErrorMessage, isImageUrl } from '@/utils/errors'
import { StaggerCard } from '@/components/StaggerCard'
import { ScreenShell } from '@/components/ScreenShell'
import { CarCard } from '@/components/rows'
import { ImageUploadField } from '@/components/ImageUploadField'
import { SkeletonList } from '@/components/Skeleton'
import { AppButton, AppCard, EmptyState, ErrorState, FormError, SuccessNote } from '@/components/ui-kit'
import { AppInput, StatusBadge } from '@/components/fields'
import { useBreakpoints } from '@/hooks/useBreakpoints'

export default function SellerCarsScreen() {
  const { columns: numColumns, isPhone } = useBreakpoints()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useSellerCars()
  const createCar = useCreateSellerCar()
  const toggleCar = useToggleSellerCar()

  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [priceText, setPriceText] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar tus autos')
    : null

  const createError = createCar.isError
    ? getApiErrorMessage(createCar.error, 'Error al crear el auto')
    : null

  const toggleError = toggleCar.isError
    ? getApiErrorMessage(toggleCar.error, 'Error al actualizar el auto')
    : null

  const togglingRowId =
    toggleCar.isPending && typeof toggleCar.variables?.id === 'number'
      ? toggleCar.variables.id
      : togglingId

  const onToggle = (car: Car) => {
    setTogglingId(car.id)
    setNotice(null)
    toggleCar.mutate(
      { id: car.id, active: !car.active },
      {
        onSuccess: () => {
          setTogglingId(null)
          setNotice(car.active ? 'Auto desactivado' : 'Auto activado')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        },
        onError: () => {
          setTogglingId(null)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        },
      }
    )
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
          setFormOpen(false)
          setName('')
          setPhotoUrl('')
          setPriceText('')
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
        footer={
          <View className="flex-row items-center justify-between gap-2">
            <StatusBadge tone={item.active ? 'success' : 'muted'}>
              {item.active ? 'Activo' : 'Inactivo'}
            </StatusBadge>
            <AppButton
              size="sm"
              variant={item.active ? 'outline' : 'default'}
              onPress={() => onToggle(item)}
              loading={togglingRowId === item.id && toggleCar.isPending}
            >
              {item.active ? 'Desactivar' : 'Activar'}
            </AppButton>
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
        <AppButton
          variant={formOpen ? 'outline' : 'default'}
          onPress={() => {
            setNameError(null)
            setPriceError(null)
            setPhotoError(null)
            createCar.reset()
            setNotice(null)
            setFormOpen(!formOpen)
          }}
        >
          {formOpen ? 'Cancelar' : 'Publicar auto'}
        </AppButton>
      }
    >
      {isLoading ? (
        <SkeletonList count={4} />
      ) : isError ? (
        <ErrorState
          message={errorMessage}
          onRetry={() => refetch()}
          retrying={isRefetching}
        />
      ) : (
        <>
          {formOpen && (
            <AppCard gap="lg">
              <Text
                accessibilityRole="header"
                className="text-lg font-bold text-foreground"
              >
                Nuevo auto
              </Text>
              <View className={isPhone ? 'gap-3' : 'flex-row gap-3'}>
                <View className="flex-1">
                  <AppInput
                    label="Nombre"
                    placeholder="Ej. Toyota Corolla 2020"
                    value={name}
                    onChangeText={(v) => {
                      setName(v)
                      setNameError(null)
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
                    }}
                    error={priceError}
                  />
                </View>
              </View>
              <ImageUploadField
                label="Foto"
                value={photoUrl}
                onUploaded={(url) => {
                  setPhotoUrl(url)
                  setPhotoError(null)
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
                }}
                error={photoError}
              />
              <FormError message={createError} />
              <View className="flex-row items-center gap-3">
                <AppButton onPress={onSubmit} loading={createCar.isPending}>
                  Publicar auto
                </AppButton>
                <AppButton variant="ghost" onPress={() => setFormOpen(false)}>
                  Cancelar
                </AppButton>
              </View>
            </AppCard>
          )}
          <FormError message={toggleError} />
          <SuccessNote message={notice} />
          <FlatList
            key={numColumns}
            numColumns={numColumns}
            columnWrapperStyle={numColumns > 1 ? { gap: 12 } : undefined}
            className="flex-1"
            contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
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
                  formOpen ? null : (
                    <AppButton onPress={() => setFormOpen(true)}>
                      Publicar auto
                    </AppButton>
                  )
                }
              />
            }
          />
        </>
      )}
    </ScreenShell>
  )
}
