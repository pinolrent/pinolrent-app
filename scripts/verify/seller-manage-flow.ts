import { api, check, createCar, registerOrLogin, summary } from './_helpers'

async function main() {
  const stamp = Date.now()
  const seller = await registerOrLogin(
    `vende_mg_${stamp}@example.com`,
    'secret123',
    true
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
  check('PATCH sin active -> 400', missingActive.status === 400)

  summary()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
