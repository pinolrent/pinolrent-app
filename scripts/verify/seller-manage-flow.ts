import {
  api,
  check,
  createCar,
  isoDaysFromNow,
  registerOrLogin,
  summary,
} from './_helpers'

async function main() {
  const stamp = Date.now()
  const seller = await registerOrLogin(
    `vende_mg_${stamp}@example.com`,
    'secret123',
    true,
    '+56912345678'
  )
  check('login seller entrega token', !!seller.token)

  const car = await createCar(seller.token, `gestion_${stamp}`, {
    photo_url: 'https://example.com/auto.jpg',
    price_per_day: 38000,
  })
  check('POST /seller/cars -> 201 active con owner', car.id > 0 && car.active === true, car)

  const badName = await api(
    '/seller/cars',
    { method: 'POST', body: JSON.stringify({ name: '' }) },
    seller.token
  )
  check('nombre vacío -> 400', badName.status === 400)

  const list = await api('/seller/cars', {}, seller.token)
  const cars = (await list.json()) as { id: number }[]
  check(
    'GET /seller/cars incluye el auto nuevo',
    list.status === 200 && cars.some((c) => c.id === car.id)
  )

  const editedName = `editado_${stamp}`
  const edit = await api(
    `/seller/cars/${car.id}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        name: editedName,
        price_per_day: 45000,
        photo_url: '',
      }),
    },
    seller.token
  )
  const edited = (await edit.json()) as {
    name: string
    price_per_day: number
    photo_url?: string
    active: boolean
  }
  check(
    'PATCH /seller/cars/{id} edita nombre, precio y quita la foto',
    edit.status === 200 &&
      edited.name === editedName &&
      edited.price_per_day === 45000 &&
      edited.photo_url === undefined,
    edited
  )

  const badPrice = await api(
    `/seller/cars/${car.id}`,
    { method: 'PATCH', body: JSON.stringify({ price_per_day: -1 }) },
    seller.token
  )
  check('PATCH con precio negativo -> 400', badPrice.status === 400)

  const off = await api(
    `/seller/cars/${car.id}`,
    { method: 'PATCH', body: JSON.stringify({ active: false }) },
    seller.token
  )
  const offBody = (await off.json()) as { active: boolean }
  check(
    'PATCH /seller/cars/{id} desactiva sin reservas -> 200',
    off.status === 200 && offBody.active === false,
    offBody
  )

  const catalog = await api(`/cars/${car.id}`)
  check('auto inactivo no visible en GET /cars/{id} -> 404', catalog.status === 404)

  const on = await api(
    `/seller/cars/${car.id}`,
    { method: 'PATCH', body: JSON.stringify({ active: true }) },
    seller.token
  )
  check('reactivar -> 200', on.status === 200)

  const missingActive = await api(
    `/seller/cars/${car.id}`,
    { method: 'PATCH', body: JSON.stringify({}) },
    seller.token
  )
  check('PATCH sin campos -> 400', missingActive.status === 400)

  const buyer = await registerOrLogin(
    `compra_mg_${stamp}@example.com`,
    'secret123',
    false
  )
  const reservation = await api(
    '/reservations',
    {
      method: 'POST',
      body: JSON.stringify({
        car_id: car.id,
        start_date: isoDaysFromNow(2),
        end_date: isoDaysFromNow(4),
      }),
    },
    buyer.token
  )
  check('POST /reservations para el auto -> 201', reservation.status === 201)

  const deactivateWithFuture = await api(
    `/seller/cars/${car.id}`,
    { method: 'PATCH', body: JSON.stringify({ active: false }) },
    seller.token
  )
  check(
    'PATCH active:false con reserva futura -> 409',
    deactivateWithFuture.status === 409
  )

  const editWithReservations = await api(
    `/seller/cars/${car.id}`,
    { method: 'PATCH', body: JSON.stringify({ price_per_day: 50000 }) },
    seller.token
  )
  const editWithReservationsBody = (await editWithReservations.json()) as {
    price_per_day: number
  }
  check(
    'editar contenido con reservas existentes -> 200',
    editWithReservations.status === 200 &&
      editWithReservationsBody.price_per_day === 50000,
    editWithReservationsBody
  )

  const deleteWithReservations = await api(
    `/seller/cars/${car.id}`,
    { method: 'DELETE' },
    seller.token
  )
  check(
    'DELETE auto con reservas -> 409',
    deleteWithReservations.status === 409,
    deleteWithReservations.status
  )

  const foreignEdit = await api(
    `/seller/cars/${car.id}`,
    { method: 'PATCH', body: JSON.stringify({ name: 'ajeno' }) },
    buyer.token
  )
  check('PATCH con token de comprador -> 403', foreignEdit.status === 403)

  const throwaway = await createCar(seller.token, `descartable_${stamp}`)
  const removed = await api(
    `/seller/cars/${throwaway.id}`,
    { method: 'DELETE' },
    seller.token
  )
  const removedBody = (await removed.json()) as { status?: string }
  check(
    'DELETE auto sin reservas -> 200 ok',
    removed.status === 200 && removedBody.status === 'ok',
    removedBody
  )

  const listAfter = await api('/seller/cars', {}, seller.token)
  const after = (await listAfter.json()) as { id: number }[]
  check(
    'el auto eliminado ya no está en GET /seller/cars',
    listAfter.status === 200 && !after.some((c) => c.id === throwaway.id)
  )

  const removeAgain = await api(
    `/seller/cars/${throwaway.id}`,
    { method: 'DELETE' },
    seller.token
  )
  check('DELETE de un auto inexistente -> 404', removeAgain.status === 404)

  summary()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
