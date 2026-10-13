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
  const seller = await registerOrLogin(`vende_${stamp}@example.com`, 'secret123', '+56912345678')
  const buyer = await registerOrLogin(`compra_${stamp}@example.com`, 'secret123')
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

  // La cuenta acumula dos reservas: alcanza para probar limit y offset.
  const minePage1 = await api('/reservations?limit=1', {}, buyer.token)
  const minePage1Body = (await minePage1.json()) as { id: number }[]
  const minePage2 = await api('/reservations?limit=1&offset=1', {}, buyer.token)
  const minePage2Body = (await minePage2.json()) as { id: number }[]
  check(
    'GET /reservations respeta limit y offset',
    minePage1.status === 200 &&
      minePage1Body.length === 1 &&
      minePage2.status === 200 &&
      minePage2Body.length === 1 &&
      minePage1Body[0].id !== minePage2Body[0].id,
    { page1: minePage1Body, page2: minePage2Body }
  )

  const sellerRes = await api('/seller/reservations', {}, seller.token)
  const sellerBody = (await sellerRes.json()) as { id: number }[]
  check(
    'GET /seller/reservations incluye la reserva del auto',
    sellerRes.status === 200 &&
      Array.isArray(sellerBody) &&
      sellerBody.some((r) => r.id === recreated.id)
  )

  const sellerPage1 = await api('/seller/reservations?limit=1', {}, seller.token)
  const sellerPage1Body = (await sellerPage1.json()) as { id: number }[]
  const sellerPage2 = await api(
    '/seller/reservations?limit=1&offset=1',
    {},
    seller.token
  )
  const sellerPage2Body = (await sellerPage2.json()) as { id: number }[]
  check(
    'GET /seller/reservations respeta limit y offset',
    sellerPage1.status === 200 &&
      sellerPage1Body.length === 1 &&
      sellerPage2.status === 200 &&
      sellerPage2Body.length === 1 &&
      sellerPage1Body[0].id !== sellerPage2Body[0].id,
    { page1: sellerPage1Body, page2: sellerPage2Body }
  )

  await api(`/reservations/${recreated.id}/cancel`, { method: 'PATCH' }, buyer.token)

  summary()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})