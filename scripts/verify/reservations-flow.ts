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
  const seller = await registerOrLogin(`vende_${stamp}@example.com`, 'secret123', true, '+56912345678')
  const buyer = await registerOrLogin(`compra_${stamp}@example.com`, 'secret123', false)
  check('login buyer y seller entregan token', !!buyer.token && !!seller.token)

  const car = await createCar(seller.token, `reserva_${stamp}`)
  check('auto creado para probar reservas', car.id > 0 && car.active === true, car)

  const start = isoDaysFromNow(1)
  const end = isoDaysFromNow(3)

  const create = await api(
    '/reservations',
    {
      method: 'POST',
      body: JSON.stringify({ car_id: car.id, start_date: start, end_date: end }),
    },
    buyer.token
  )
  const created = (await create.json()) as {
    id: number
    status: string
    payment?: unknown
  }
  check(
    'POST /reservations crea reserva pending sin pago',
    create.status === 201 &&
      created.status === 'pending' &&
      created.payment === undefined,
    created
  )

  const overlap = await api(
    '/reservations',
    {
      method: 'POST',
      body: JSON.stringify({ car_id: car.id, start_date: start, end_date: end }),
    },
    buyer.token
  )
  check('overlap sobre el mismo rango -> 409', overlap.status === 409)

  const invalidRange = await api(
    '/reservations',
    {
      method: 'POST',
      body: JSON.stringify({ car_id: car.id, start_date: end, end_date: start }),
    },
    buyer.token
  )
  check('end < start -> 400', invalidRange.status === 400)

  const pastStart = await api(
    '/reservations',
    {
      method: 'POST',
      body: JSON.stringify({
        car_id: car.id,
        start_date: isoDaysFromNow(-1),
        end_date: isoDaysFromNow(1),
      }),
    },
    buyer.token
  )
  check('start anterior a hoy -> 400', pastStart.status === 400)

  const cancel = await api(
    `/reservations/${created.id}/cancel`,
    { method: 'PATCH' },
    buyer.token
  )
  const cancelled = (await cancel.json()) as { status: string }
  check(
    'PATCH /reservations/{id}/cancel -> cancelled',
    cancel.status === 200 && cancelled.status === 'cancelled',
    cancelled
  )

  const recreate = await api(
    '/reservations',
    {
      method: 'POST',
      body: JSON.stringify({ car_id: car.id, start_date: start, end_date: end }),
    },
    buyer.token
  )
  const recreated = (await recreate.json()) as { id: number; status: string }
  check(
    're-reservar el mismo rango tras cancelar -> 201',
    recreate.status === 201 && recreated.status === 'pending',
    recreated
  )

  const mine = await api('/reservations', {}, buyer.token)
  const mineBody = (await mine.json()) as { id: number }[]
  check(
    'GET /reservations incluye la reserva nueva',
    mine.status === 200 &&
      Array.isArray(mineBody) &&
      mineBody.some((r) => r.id === recreated.id)
  )

  const sellerRes = await api('/seller/reservations', {}, seller.token)
  const sellerBody = (await sellerRes.json()) as { id: number }[]
  check(
    'GET /seller/reservations incluye la reserva del auto',
    sellerRes.status === 200 &&
      Array.isArray(sellerBody) &&
      sellerBody.some((r) => r.id === recreated.id)
  )

  await api(`/reservations/${recreated.id}/cancel`, { method: 'PATCH' }, buyer.token)

  summary()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})