const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080'

let passed = 0
let failed = 0

function check(name: string, ok: boolean, detail?: unknown) {
  if (ok) {
    passed++
    console.log(`✓ ${name}`)
  } else {
    failed++
    console.log(`✗ ${name}`, detail ?? '')
  }
}

async function api(
  path: string,
  init?: RequestInit,
  token?: string
): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })
}

async function registerOrLogin(
  email: string,
  password: string,
  seller: boolean
): Promise<{ token: string }> {
  await api(seller ? '/auth/register/seller' : '/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  const res = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(`login failed: ${res.status}`)
  return (await res.json()) as { token: string }
}

function isoDaysFromNow(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)
}

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

  const carRes = await api(
    '/seller/cars',
    {
      method: 'POST',
      body: JSON.stringify({
        name: `pago_${stamp}`,
        price_per_day: 45000,
      }),
    },
    seller.token
  )
  const car = (await carRes.json()) as { id: number; active: boolean }
  check(
    'POST /seller/cars crea auto activo',
    carRes.status === 201 && car.id > 0 && car.active === true,
    car
  )

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

  console.log(`\n${passed} pasaron, ${failed} fallaron`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
