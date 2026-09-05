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

async function me(token: string) {
  const res = await api('/auth/me', {}, token)
  return { status: res.status, body: await res.json() }
}

const EMAIL = `flow_${Date.now()}@example.com`

async function main() {
  const buyer = await login('compra@example.com', 'secret123')
  const buyerMe = await me(buyer.token)
  check('login buyer devuelve token', !!buyer.token)
  check(
    'me(token explícito) devuelve rol buyer',
    buyerMe.status === 200 && buyerMe.body.role === 'buyer',
    buyerMe.body
  )

  const seller = await login('vende@example.com', 'secret123')
  const sellerMe = await me(seller.token)
  check('login seller devuelve token', !!seller.token)
  check(
    'me(token explícito) devuelve rol seller',
    sellerMe.status === 200 && sellerMe.body.role === 'seller',
    sellerMe.body
  )

  const regBuyer = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: 'secret123' }),
  })
  check('register buyer responde 201', regBuyer.status === 201, regBuyer.status)

  const regSell = await api('/auth/register/seller', {
    method: 'POST',
    body: JSON.stringify({ email: `${EMAIL}seller`, password: 'secret123' }),
  })
  check(
    'register/seller responde 201',
    regSell.status === 201,
    regSell.status
  )

  const badLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: 'wrong' }),
  })
  check('login con credenciales inválidas -> 401', badLogin.status === 401)

  const noToken = await api('/auth/me')
  check('me sin token -> 401', noToken.status === 401)

  const logout = await api('/auth/logout', { method: 'POST' }, buyer.token)
  check(
    'logout con token responde ok',
    logout.status === 200 && (await logout.json()).status === 'ok'
  )

  console.log(`\n${passed} pasaron, ${failed} fallaron`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})