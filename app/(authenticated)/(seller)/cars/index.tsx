import { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native'
import { Button, ButtonText } from '../../../../components/ui/button'
import {
  useCreateSellerCar,
  useSellerCars,
  useToggleSellerCar,
} from '@/hooks/useSellerCars'
import type { Car } from '@/types/car'
import { formatPrice } from '@/utils/currency'
import { getApiErrorMessage } from '@/utils/errors'

export default function SellerCarsScreen() {
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
    ? getApiErrorMessage(toggleCar.error, 'Error al actualizar el auto')
    : null

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.subtitle}>{errorMessage}</Text>
        <Button variant="default" onPress={() => refetch()}>
          <ButtonText>Reintentar</ButtonText>
        </Button>
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
      if (!/^https?:\/\/.+/i.test(trimmedPhoto)) {
        setClientError('photo_url inválido')
        return
      }
    }
    let price: number | undefined
    if (priceText.trim().length > 0) {
      price = Number(priceText.trim())
      if (!Number.isInteger(price) || price < 0 || price > 100_000_000) {
        setClientError('price_per_day debe ser entero entre 0 y 100000000')
        return
      }
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

  const renderItem = ({ item }: { item: Car }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={{ color: item.active ? '#15803d' : '#6b7280' }}>
          {item.active ? 'Activo' : 'Inactivo'}
        </Text>
      </View>
      <Text style={styles.cardPrice}>
        {formatPrice(item.price_per_day)} / día
      </Text>
      {togglingId === item.id && toggleCar.isPending ? (
        <ActivityIndicator />
      ) : (
        <Button
          variant={item.active ? 'destructive' : 'default'}
          onPress={() => onToggle(item)}
          disabled={toggleCar.isPending}
        >
          <ButtonText>{item.active ? 'Desactivar' : 'Activar'}</ButtonText>
        </Button>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <Button
        variant="default"
        onPress={() => {
          setClientError(null)
          createCar.reset()
          setFormOpen(!formOpen)
        }}
      >
        <ButtonText>{formOpen ? 'Cerrar formulario' : 'Agregar auto'}</ButtonText>
      </Button>
      {formOpen && (
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Nombre (obligatorio)"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="photo_url (opcional, https://...)"
            placeholderTextColor="#888"
            autoCapitalize="none"
            autoCorrect={false}
            value={photoUrl}
            onChangeText={setPhotoUrl}
          />
          <TextInput
            style={styles.input}
            placeholder="price_per_day en centavos (opcional)"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={priceText}
            onChangeText={setPriceText}
          />
          {(clientError || createError) && (
            <Text style={styles.error}>{clientError ?? createError}</Text>
          )}
          <Button onPress={onSubmit} disabled={createCar.isPending}>
            {createCar.isPending ? (
              <ActivityIndicator />
            ) : (
              <ButtonText>Crear auto</ButtonText>
            )}
          </Button>
        </View>
      )}
      {toggleError && <Text style={styles.error}>{toggleError}</Text>}
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.subtitle}>No tenés autos publicados</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  list: { flex: 1 },
  listContent: { gap: 12, paddingBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#000', flex: 1 },
  cardPrice: { fontSize: 14, color: '#444' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#000',
  },
  error: { color: '#ff6467' },
  subtitle: { color: '#aaa' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
})
