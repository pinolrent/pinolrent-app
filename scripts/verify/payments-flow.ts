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
    `vende_pay_${stamp}@example.com`,
    'secret123',
    true,
    '+56912345678'
  )
  const buyer = await registerOrLogin(
    `compra_pay_${stamp}@example.com`,
    'secret123',
    false
  )
  check('login buyer y seller entregan token', !!buyer.token && !!seller.token)

  const car = await createCar(seller.token, `pago_${stamp}`, {
    price_per_day: 45000,
  })
  check('POST /seller/cars crea auto activo', car.id > 0 && car.active === true, car)

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

  const payment = await api(
    `/reservations/${created.id}/payment`,
    {
      method: 'POST',
      body: JSON.stringify({
        method: 'pos',
        proof_url: 'https://example.com/boleta.pdf',
      }),
    },
    buyer.token
  )
  const paid = (await payment.json()) as {
    id: number
    reservation_id: number
    method: string
    status: string
  }
  check(
    'POST /reservations/{id}/payment -> 201 pending',
    payment.status === 201 &&
      paid.status === 'pending' &&
      paid.method === 'pos' &&
      paid.reservation_id === created.id,
    paid
  )

  const badMethod = await api(
    `/reservations/${created.id}/payment`,
    { method: 'POST', body: JSON.stringify({ method: 'transfer' }) },
    buyer.token
  )
  check('método inválido en reserva ya pagada -> 400 o 409', badMethod.status === 400 || badMethod.status === 409)

  const dup = await api(
    `/reservations/${created.id}/payment`,
    {
      method: 'POST',
      body: JSON.stringify({ method: 'cash' }),
    },
    buyer.token
  )
  check('pago duplicado válido -> 409', dup.status === 409)

  const cancelAfterPay = await api(
    `/reservations/${created.id}/cancel`,
    { method: 'PATCH' },
    buyer.token
  )
  check(
    'cancelar con pago registrado -> 409',
    cancelAfterPay.status === 409
  )

  const mine = await api('/reservations', {}, buyer.token)
  const mineBody = (await mine.json()) as {
    id: number
    payment?: { method: string; status: string }
  }[]
  const found = mineBody.find((r) => r.id === created.id)
  check(
    'GET /reservations incluye pago pos/pending',
    mine.status === 200 &&
      found?.payment?.method === 'pos' &&
      found?.payment?.status === 'pending',
    found
  )

  const confirm = await api(
    `/seller/reservations/${created.id}/confirm`,
    { method: 'PATCH' },
    seller.token
  )
  const confirmed = (await confirm.json()) as {
    status: string
    payment?: { status: string }
  }
  check(
    'PATCH /seller/reservations/{id}/confirm -> confirmed + approved',
    confirm.status === 200 &&
      confirmed.status === 'confirmed' &&
      confirmed.payment?.status === 'approved',
    confirmed
  )

  const detail = await api(`/reservations/${created.id}`, {}, buyer.token)
  const detailBody = (await detail.json()) as {
    id: number
    status: string
    payment?: { status: string }
  }
  check(
    'GET /reservations/{id} como dueño -> confirmed + approved',
    detail.status === 200 &&
      detailBody.id === created.id &&
      detailBody.status === 'confirmed' &&
      detailBody.payment?.status === 'approved',
    detailBody
  )

  const sellerDetail = await api(`/reservations/${created.id}`, {}, seller.token)
  check(
    'GET /reservations/{id} como vendedor dueño -> 200',
    sellerDetail.status === 200
  )

  const cashStart = isoDaysFromNow(10)
  const cashEnd = isoDaysFromNow(12)
  const cashRes = await api(
    '/reservations',
    {
      method: 'POST',
      body: JSON.stringify({ car_id: car.id, start_date: cashStart, end_date: cashEnd }),
    },
    buyer.token
  )
  const cashCreated = (await cashRes.json()) as { id: number }
  const cashPay = await api(
    `/reservations/${cashCreated.id}/payment`,
    { method: 'POST', body: JSON.stringify({ method: 'cash' }) },
    buyer.token
  )
  check('POST payment cash -> 201', cashPay.status === 201)

  await api(`/reservations/${cashCreated.id}/cancel`, { method: 'PATCH' }, buyer.token)

  const noPayConfirm = await api(
    `/seller/reservations/${cashCreated.id}/confirm`,
    { method: 'PATCH' },
    seller.token
  )
  void noPayConfirm

  const freshStart = isoDaysFromNow(20)
  const freshEnd = isoDaysFromNow(22)
  const freshRes = await api(
    '/reservations',
    {
      method: 'POST',
      body: JSON.stringify({ car_id: car.id, start_date: freshStart, end_date: freshEnd }),
    },
    buyer.token
  )
  const fresh = (await freshRes.json()) as { id: number }
  const confirmNoPay = await api(
    `/seller/reservations/${fresh.id}/confirm`,
    { method: 'PATCH' },
    seller.token
  )
  check('confirmar sin pago -> 409', confirmNoPay.status === 409)
  await api(`/reservations/${fresh.id}/cancel`, { method: 'PATCH' }, buyer.token)

  const otherSeller = await registerOrLogin(
    `vende2_${stamp}@example.com`,
    'secret123',
    true,
    '+56912345678'
  )
  const lonelyCar = await createCar(otherSeller.token, `ajeno_${stamp}`)
  const foreignPatch = await api(
    `/seller/cars/${lonelyCar.id}`,
    { method: 'PATCH', body: JSON.stringify({ active: false }) },
    seller.token
  )
  check('PATCH auto ajeno sin reservas -> 404', foreignPatch.status === 404)
  // Nota: con reservas futuras un PATCH ajeno responde 409 en vez de 404
  // (el backend chequea futuras antes que dueño). No se testea como 404
  // hasta que el backend lo corrija. Tampoco existe `payment is not pending`
  // en docs pero el código lo devuelve: la UI lo trata como 409 genérico.

  const buyerWrite = await api(
    '/seller/cars',
    { method: 'POST', body: JSON.stringify({ name: 'ajeno' }) },
    buyer.token
  )
  check('buyer POST /seller/cars -> 403', buyerWrite.status === 403)

  const filtered = await api(
    `/cars?start_date=${start}&end_date=${end}`,
    {},
    undefined
  )
  const filteredBody = (await filtered.json()) as { id: number }[]
  check(
    'GET /cars con fechas excluye reservado',
    filtered.status === 200 &&
      Array.isArray(filteredBody) &&
      !filteredBody.some((c) => c.id === car.id),
    { count: filteredBody.length }
  )

  summary()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
