import { useCallback, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import {
  useCreateSellerCar,
  useSellerCars,
  useToggleSellerCar,
} from '@/hooks/useSellerCars'
import type { Car } from '@/types/car'
import { formatPrice } from '@/utils/currency'
import { getApiErrorMessage, isHttpUrl } from '@/utils/errors'
import { StaggerCard } from '@/components/StaggerCard'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { CarImage } from '@/components/CarImage'
import { SkeletonList } from '@/components/Skeleton'
import { AppButton, AppCard, EmptyState, FormError } from '@/components/ui-kit'
import { AppInput, StatusBadge } from '@/components/fields'

function specificToggleError(err: unknown) {
  const msg = getApiErrorMessage(err, 'Error al actualizar el auto')
  if (msg.includes('future reservations')) {
    return 'No se puede desactivar: tiene reservas futuras'
  }
  return msg
}

export default function SellerCarsScreen() {
  const { columns: numColumns } = useBreakpoints()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useSellerCars()
  const createCar = useCreateSellerCar()
  const toggleCar = useToggleSellerCar()

  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [priceText, setPriceText] = useState('')
  const [clientError, setClientError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar tus autos')
    : null

  const createError = createCar.isError
    ? getApiErrorMessage(createCar.error, 'Error al crear el auto')
    : null

  const toggleError = toggleCar.isError
    ? specificToggleError(toggleCar.error)
    : null

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <SkeletonList count={4} />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background p-4">
        <Text className="text-muted-foreground">{errorMessage}</Text>
        <AppButton onPress={() => refetch()}>Reintentar</AppButton>
      </View>
    )
  }

  const onSubmit = () => {
    const trimmedName = name.trim()
    const trimmedPhoto = photoUrl.trim()
    if (!trimmedName) {
      setClientError('El nombre es obligatorio')
      return
    }
    if (trimmedName.length > 200) {
      setClientError('El nombre es demasiado largo (máx. 200)')
      return
    }
    if (trimmedPhoto.length > 0) {
      if (trimmedPhoto.length > 2048) {
        setClientError('photo_url es demasiado largo')
        return
      }
      if (!isHttpUrl(trimmedPhoto)) {
        setClientError('photo_url inválido')
        return
      }
    }
    let price: number | undefined
    if (priceText.trim().length > 0) {
      const dollars = Number(priceText.trim().replace(',', '.'))
      if (!Number.isFinite(dollars) || dollars < 0 || dollars > 1_000_000) {
        setClientError('Precio inválido, usa dólares entre 0 y 1000000')
        return
      }
      price = Math.round(dollars * 100)
    }
    setClientError(null)
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
        },
      }
    )
  }

  const togglingRowId =
    toggleCar.isPending && typeof toggleCar.variables?.id === 'number'
      ? toggleCar.variables.id
      : togglingId

  const onToggle = (car: Car) => {
    setTogglingId(car.id)
    toggleCar.mutate(
      { id: car.id, active: !car.active },
      {
        onSuccess: () => setTogglingId(null),
        onError: () => setTogglingId(null),
      }
    )
  }

  const renderItem = useCallback(
    ({ item, index }: { item: Car; index: number }) => (
    <StaggerCard index={index}>
    <AppCard className={numColumns > 1 ? 'flex-1' : undefined}>
      <CarImage uri={item.photo_url} name={item.name} />
      <View className="flex-row items-center justify-between gap-2">
        <Text numberOfLines={1} className="flex-1 text-base font-bold text-foreground">
          {item.name}
        </Text>
        <StatusBadge tone={item.active ? 'success' : 'muted'}>
          {item.active ? 'Activo' : 'Inactivo'}
        </StatusBadge>
      </View>
      <Text className="text-sm text-muted-foreground">
        {formatPrice(item.price_per_day)} / día
      </Text>
      {togglingRowId === item.id && toggleCar.isPending ? (
        <ActivityIndicator />
      ) : (
        <AppButton
          variant={item.active ? 'destructive' : 'default'}
          onPress={() => onToggle(item)}
          disabled={toggleCar.isPending && togglingRowId === item.id}
        >
          {item.active ? 'Desactivar' : 'Activar'}
        </AppButton>
      )}
    </AppCard>
    </StaggerCard>
  ),
    [numColumns, onToggle, togglingRowId, toggleCar.isPending]
  )

  return (
    <View className="flex-1 gap-3 bg-background p-4">
      <AppButton
        onPress={() => {
          setClientError(null)
          createCar.reset()
          setFormOpen(!formOpen)
        }}
      >
        {formOpen ? 'Cerrar formulario' : 'Agregar auto'}
      </AppButton>
      {formOpen && (
        <AppCard>
          <AppInput
            label="Nombre"
            placeholder="Nombre (obligatorio)"
            value={name}
            onChangeText={setName}
          />
          <AppInput
            label="Foto"
            placeholder="photo_url (opcional, https://...)"
            autoCapitalize="none"
            autoCorrect={false}
            value={photoUrl}
            onChangeText={setPhotoUrl}
          />
          <AppInput
            label="Precio por día (USD)"
            placeholder="Ej. 45.00 (se guarda en centavos)"
            keyboardType="decimal-pad"
            value={priceText}
            onChangeText={setPriceText}
          />
          <FormError message={clientError ?? createError} />
          <AppButton onPress={onSubmit} disabled={createCar.isPending}>
            {createCar.isPending ? <ActivityIndicator /> : 'Crear auto'}
          </AppButton>
        </AppCard>
      )}
      <FormError message={toggleError} />
      <FlatList
        key={numColumns}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? { gap: 12 } : undefined}
        className="flex-1"
        contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        ListEmptyComponent={
          <EmptyState message="No hay autos publicados" />
        }
      />
    </View>
  )
}

