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

const STAMP = Date.now()

async function main() {
  const seller = await login('vende@example.com', 'secret123')
  check('login seller devuelve token', !!seller.token)

  const carA = await createCar(seller.token, `catalogo_${STAMP}_A`)
  check(
    'POST /seller/cars crea auto activo',
    carA.id > 0 && carA.active === true,
    carA
  )

  const carB = await createCar(seller.token, `catalogo_${STAMP}_B`)
  check('POST /seller/cars crea segundo auto', carB.id > 0, carB)

  const single = await api('/cars?limit=1')
  const singleBody = (await single.json()) as unknown[]
  check(
    'GET /cars?limit=1 respeta limit',
    single.status === 200 && singleBody.length === 1,
    singleBody.length
  )

  const all = await api('/cars?limit=200')
  const allBody = (await all.json()) as { id: number; name: string }[]
  check(
    'GET /cars sin token es público y lista el auto',
    all.status === 200 && allBody.some((c) => c.id === carA.id && c.name === carA.name)
  )

  const detail = await api(`/cars/${carA.id}`)
  const detailBody = (await detail.json()) as { name: string }
  check(
    'GET /cars/{id} devuelve el auto',
    detail.status === 200 && detailBody.name === carA.name,
    detailBody
  )

  const deactivate = await api(
    `/seller/cars/${carA.id}`,
    { method: 'PATCH', body: JSON.stringify({ active: false }) },
    seller.token
  )
  const deactiveBody = (await deactivate.json()) as { active: boolean }
  check(
    'PATCH /seller/cars/{id} inactiva el auto',
    deactivate.status === 200 && deactiveBody.active === false,
    deactiveBody
  )

  const hidden = await api(`/cars/${carA.id}`)
  check(
    'GET /cars/{id} -> 404 si el auto está inactivo',
    hidden.status === 404,
    hidden.status
  )

  console.log(`\n${passed} pasaron, ${failed} fallaron`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})