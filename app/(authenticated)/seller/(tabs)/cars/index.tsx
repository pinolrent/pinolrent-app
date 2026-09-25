import { useEffect, useState } from 'react'
import { View, FlatList, RefreshControl } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCreateSellerCar, useSellerCars } from '@/hooks/useSellerCars'
import { useTransientNotice } from '@/hooks/useTransientNotice'
import type { Car } from '@/types/car'
import { getApiErrorMessage } from '@/utils/errors'
import { StaggerCard } from '@/components/StaggerCard'
import { ScreenShell } from '@/components/ScreenShell'
import { CarCard } from '@/components/rows'
import { SellerCarForm } from '@/components/SellerCarForm'
import { SkeletonList } from '@/components/Skeleton'
import { ModalSheet } from '@/components/ModalSheet'
import {
  AppButton,
  EmptyState,
  ErrorState,
  SuccessNote,
} from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useThemeColors } from '@/hooks/useThemeColors'
import { SHEET_FORM_WIDTH } from '@/constants/layout'

export default function SellerCarsScreen() {
  const router = useRouter()
  const colors = useThemeColors()
  const { deleted } = useLocalSearchParams<{ deleted?: string }>()
  const { columns: numColumns, isWide } = useBreakpoints()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useSellerCars()
  const createCar = useCreateSellerCar()

  const [formOpen, setFormOpen] = useState(false)
  const [notice, setNotice] = useTransientNotice()

  useEffect(() => {
    if (deleted) setNotice('Auto eliminado')
  }, [deleted, setNotice])

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar tus autos')
    : null

  const createError = createCar.isError
    ? getApiErrorMessage(createCar.error, 'Error al crear el auto')
    : null

  const openForm = () => {
    createCar.reset()
    setNotice(null)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    createCar.reset()
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
        isWide ? (
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
                tintColor={colors.primary}
                colors={[colors.primary]}
                progressBackgroundColor={colors.card}
              />
            }
            ListEmptyComponent={
              <EmptyState
                message="Todavía no publicaste autos"
                action={
                  isWide ? (
                    <AppButton onPress={openForm}>Publicar auto</AppButton>
                  ) : undefined
                }
              />
            }
          />
          {!isWide && (
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
        maxWidth={SHEET_FORM_WIDTH}
        busy={createCar.isPending}
      >
        {formOpen ? (
          <SellerCarForm
            submitLabel="Publicar auto"
            loading={createCar.isPending}
            error={createError}
            onDirty={() => {
              if (createCar.isError) createCar.reset()
            }}
            onSubmit={(values) => {
              createCar.mutate(values, {
                onSuccess: () => {
                  closeForm()
                  setNotice(`${values.name} publicado`)
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  )
                },
                onError: () => {
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Error
                  )
                },
              })
            }}
            onCancel={closeForm}
          />
        ) : null}
      </ModalSheet>
    </ScreenShell>
  )
}
