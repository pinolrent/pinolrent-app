const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080'

let passed = 0
let failed = 0

function check(name: string, ok: boolean, detail?: unknown) {
  if (ok) {
    passed++
    console.log(`\x1b[32m✓\x1b[0m ${name}`)
  } else {
    failed++
    console.log(`\x1b[31m✗\x1b[0m ${name}`, detail ?? '')
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

async function login(
  email: string,
  password: string
): Promise<{ token: string }> {
  const res = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(`login failed: ${res.status}`)
  return (await res.json()) as { token: string }
}

async function createCar(
  token: string,
  name: string
): Promise<{ id: number; name: string; active: boolean }> {
  const res = await api(
    '/seller/cars',
    {
      method: 'POST',
      body: JSON.stringify({ name, price_per_day: 20000 }),
    },
    token
  )
  if (!res.ok) throw new Error(`create car failed: ${res.status}`)
  return (await res.json()) as { id: number; name: string; active: boolean }
}

function isoDaysFromNow(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)
}

async function main() {
  const seller = await login('vende@example.com', 'secret123')
  const buyer = await login('compra@example.com', 'secret123')
  check('login buyer y seller entregan token', !!buyer.token && !!seller.token)

  const car = await createCar(seller.token, `reserva_${Date.now()}`)
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

  console.log(`\n${passed} pasaron, ${failed} fallaron`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})