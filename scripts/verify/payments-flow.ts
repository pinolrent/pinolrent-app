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
    true
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

  summary()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
