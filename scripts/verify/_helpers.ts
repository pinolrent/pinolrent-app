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

export async function registerOrLogin(
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
