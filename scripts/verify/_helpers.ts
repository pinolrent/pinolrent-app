export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080'

let passed = 0
let failed = 0

export function check(name: string, ok: boolean, detail?: unknown) {
  if (ok) {
    passed++
    console.log(`✓ ${name}`)
  } else {
    failed++
    console.log(`✗ ${name}`, detail ?? '')
  }
}

export function summary() {
  console.log(`\n${passed} pasaron, ${failed} fallaron`)
  process.exit(failed === 0 ? 0 : 1)
}

export async function api(
  path: string,
  init?: RequestInit,
  token?: string,
  retries = 5
): Promise<Response> {
  let res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })
  for (let i = 0; i < retries && res.status === 429; i++) {
    const wait = Number(res.headers.get('Retry-After') ?? 2)
    await new Promise((r) => setTimeout(r, (Number.isFinite(wait) ? wait : 2) * 1000))
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    })
  }
  return res
}

export async function registerOrLogin(
  email: string,
  password: string,
  phone?: string
): Promise<{ token: string }> {
  // Una sola cuenta por email: el teléfono es lo que habilita vender, así que
  // un vendedor se registra con teléfono.
  await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(
      phone ? { email, password, phone } : { email, password }
    ),
  })
  const res = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(`login failed: ${res.status}`)
  return (await res.json()) as { token: string }
}

// El rol admin sale solo de ADMIN_EMAILS del API: si la cuenta no lo tiene,
// el flujo no puede correr y conviene decirlo con claridad.
export const ADMIN_EMAIL = process.env.VERIFY_ADMIN_EMAIL ?? 'verify-admin@example.com'

export async function registerOrLoginAdmin(): Promise<{ token: string }> {
  const session = await registerOrLogin(ADMIN_EMAIL, 'secret123')
  const res = await api('/auth/me', {}, session.token)
  const me = (await res.json()) as { roles?: string[] }
  if (!me.roles?.includes('admin')) {
    throw new Error(
      `La cuenta ${ADMIN_EMAIL} no tiene el rol admin. Levanta el API con ADMIN_EMAILS=${ADMIN_EMAIL} (el rol se sincroniza al arrancar).`
    )
  }
  return session
}

export function isoDaysFromNow(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)
}

export async function createCar(
  token: string,
  name: string,
  overrides?: { price_per_day?: number; photo_url?: string }
): Promise<{ id: number; name: string; active: boolean }> {
  const res = await api(
    '/seller/cars',
    {
      method: 'POST',
      body: JSON.stringify({ name, price_per_day: 20000, ...overrides }),
    },
    token
  )
  if (!res.ok) throw new Error(`create car failed: ${res.status}`)
  return (await res.json()) as { id: number; name: string; active: boolean }
}
