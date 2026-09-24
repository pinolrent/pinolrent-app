import { useState } from 'react'
import { RefreshControl, ScrollView, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import {
  useDeleteSellerCar,
  useSellerCars,
  useUpdateSellerCar,
} from '@/hooks/useSellerCars'
import { useTransientNotice } from '@/hooks/useTransientNotice'
import { CarPhoto } from '@/components/rows'
import { SellerCarForm } from '@/components/SellerCarForm'
import { formatPricePerDay } from '@/utils/currency'
import { getApiErrorMessage } from '@/utils/errors'
import { ScreenShell } from '@/components/ScreenShell'
import { ModalSheet } from '@/components/ModalSheet'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import {
  AppButton,
  AppCard,
  ErrorState,
  FormError,
  SuccessNote,
} from '@/components/ui-kit'
import { StatusBadge } from '@/components/fields'
import { SkeletonList } from '@/components/Skeleton'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useThemeColors } from '@/hooks/useThemeColors'
import { SHEET_FORM_WIDTH } from '@/constants/layout'

export default function SellerCarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const idNum = Number(id)
  const invalidId = !Number.isFinite(idNum)
  const { isWide } = useBreakpoints()
  const colors = useThemeColors()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useSellerCars()
  const updateCar = useUpdateSellerCar()
  const deleteCar = useDeleteSellerCar()
  const [notice, setNotice] = useTransientNotice()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const car = data?.find((item) => item.id === idNum)

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Error al cargar el auto')
    : null

  if (isLoading) {
    return (
      <ScreenShell topInset={false}>
        <Stack.Screen options={{ title: 'Auto' }} />
        <SkeletonList count={1} />
      </ScreenShell>
    )
  }

  if (invalidId || isError || !car) {
    return (
      <ScreenShell topInset={false}>
        <Stack.Screen options={{ title: 'Auto' }} />
        <ErrorState
          message={errorMessage ?? 'No encontramos ese auto'}
          onRetry={invalidId ? undefined : () => refetch()}
          retrying={isRefetching}
          centered
        />
      </ScreenShell>
    )
  }

  const updateError = updateCar.isError
    ? getApiErrorMessage(updateCar.error, 'Error al actualizar el auto')
    : null

  const deleteError = deleteCar.isError
    ? getApiErrorMessage(deleteCar.error, 'Error al eliminar el auto')
    : null

  const onToggle = () => {
    setNotice(null)
    updateCar.mutate(
      { id: car.id, data: { active: !car.active } },
      {
        onSuccess: () => {
          setNotice(car.active ? 'Auto desactivado' : 'Auto activado')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        },
        onError: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        },
      }
    )
  }

  const onDelete = () => {
    deleteCar.mutate(car.id, {
      onSuccess: () => {
        setDeleteOpen(false)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        router.replace({
          pathname: '/(authenticated)/seller/cars',
          params: { deleted: '1' },
        })
      },
      onError: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      },
    })
  }

  return (
    <ScreenShell topInset={false}>
      <Stack.Screen options={{ title: car.name }} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.card}
          />
        }
      >
        <View className={isWide ? 'flex-row items-start gap-6' : 'gap-4'}>
          <View className="flex-1">
            <CarPhoto uri={car.photo_url} name={car.name} />
          </View>
          <View className={isWide ? 'w-80 gap-3' : 'gap-3'}>
            <AppCard gap="sm">
              <Text className="text-lg font-bold text-foreground">
                {car.name}
              </Text>
              <Text className="text-sm text-foreground">
                {formatPricePerDay(car.price_per_day)}
              </Text>
              <StatusBadge tone={car.active ? 'success' : 'muted'}>
                {car.active ? 'Activo' : 'Inactivo'}
              </StatusBadge>
            </AppCard>
            <SuccessNote message={notice} />
            <FormError message={updateError} />
            <AppButton
              onPress={() => {
                setNotice(null)
                updateCar.reset()
                setEditOpen(true)
              }}
            >
              Editar
            </AppButton>
            <AppButton
              variant="outline"
              onPress={onToggle}
              loading={updateCar.isPending && !editOpen}
            >
              {car.active ? 'Desactivar' : 'Activar'}
            </AppButton>
            <View className="mt-1 border-t border-border pt-4">
              <AppButton
                variant="destructive-outline"
                onPress={() => {
                  setNotice(null)
                  deleteCar.reset()
                  setDeleteOpen(true)
                }}
              >
                Eliminar
              </AppButton>
            </View>
          </View>
        </View>
      </ScrollView>
      <ModalSheet
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar auto"
        maxWidth={SHEET_FORM_WIDTH}
        busy={updateCar.isPending}
      >
        {editOpen ? (
          <SellerCarForm
            initialName={car.name}
            initialPhotoUrl={car.photo_url ?? ''}
            initialPriceCents={car.price_per_day}
            submitLabel="Guardar cambios"
            loading={updateCar.isPending}
            error={updateCar.isError ? updateError : null}
            onDirty={() => {
              if (updateCar.isError) updateCar.reset()
            }}
            onSubmit={(values) => {
              updateCar.mutate(
                {
                  id: car.id,
                  data: {
                    name: values.name,
                    price_per_day: values.price_per_day ?? 0,
                    photo_url: values.photo_url ?? '',
                  },
                },
                {
                  onSuccess: () => {
                    setEditOpen(false)
                    setNotice('Auto actualizado')
                    Haptics.notificationAsync(
                      Haptics.NotificationFeedbackType.Success
                    )
                  },
                  onError: () => {
                    Haptics.notificationAsync(
                      Haptics.NotificationFeedbackType.Error
                    )
                  },
                }
              )
            }}
            onCancel={() => setEditOpen(false)}
          />
        ) : null}
      </ModalSheet>
      <ConfirmDialog
        visible={deleteOpen}
        title="Eliminar auto"
        message={`¿Eliminar ${car.name}? Solo se puede eliminar un auto que nunca tuvo reservas; si las tiene, desactívalo en su lugar.`}
        confirmLabel="Eliminar"
        destructive
        loading={deleteCar.isPending}
        error={deleteError}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={onDelete}
      />
    </ScreenShell>
  )
}
