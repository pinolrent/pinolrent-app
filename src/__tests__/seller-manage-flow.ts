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

async function main() {
  const stamp = Date.now()
  const seller = await registerOrLogin(
    `vende_mg_${stamp}@example.com`,
    'secret123',
    true
  )
  check('login seller entrega token', !!seller.token)

  const create = await api(
    '/seller/cars',
    {
      method: 'POST',
      body: JSON.stringify({
        name: `gestion_${stamp}`,
        photo_url: 'https://example.com/auto.jpg',
        price_per_day: 38000,
      }),
    },
    seller.token
  )
  const car = (await create.json()) as {
    id: number
    name: string
    active: boolean
    price_per_day: number
  }
  check(
    'POST /seller/cars -> 201 active con owner',
    create.status === 201 && car.id > 0 && car.active === true,
    car
  )

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

  console.log(`\n${passed} pasaron, ${failed} fallaron`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
