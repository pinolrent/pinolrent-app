import { api, check, registerOrLogin, summary } from './_helpers'

async function me(token: string) {
  const res = await api('/auth/me', {}, token)
  return { status: res.status, body: await res.json() }
}

const STAMP = Date.now()
const EMAIL = `flow_${STAMP}@example.com`
const SELLER_EMAIL = `flow_${STAMP}seller@example.com`

async function main() {
  const stamp = Date.now()
  const buyer = await registerOrLogin(`compra_${stamp}@example.com`, 'secret123', false)
  const buyerMe = await me(buyer.token)
  check('login buyer devuelve token', !!buyer.token)
  check(
    'me(token explícito) devuelve rol buyer',
    buyerMe.status === 200 && buyerMe.body.role === 'buyer',
    buyerMe.body
  )

  const seller = await registerOrLogin(`vende_${stamp}@example.com`, 'secret123', true, '+56912345678')
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
    body: JSON.stringify({ email: SELLER_EMAIL, password: 'secret123', phone: '+56912345678' }),
  })
  check(
    'register/seller responde 201',
    regSell.status === 201,
    regSell.status
  )

  const regSellNoPhone = await api('/auth/register/seller', {
    method: 'POST',
    body: JSON.stringify({ email: `nophone_${stamp}@example.com`, password: 'secret123' }),
  })
  check(
    'register/seller sin telefono -> 400',
    regSellNoPhone.status === 400,
    regSellNoPhone.status
  )

  const patchPhone = await api('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({ phone: '+56987654321' }),
  }, seller.token)
  check('PATCH /auth/me actualiza telefono', patchPhone.status === 200, patchPhone.status)

  const badLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: 'wrong' }),
  })
  check('login con credenciales inválidas -> 401', badLogin.status === 401)

  const noToken = await api('/auth/me')
  check('me sin token -> 401', noToken.status === 401)

  const freshLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: 'secret123' }),
  })
  const pair = (await freshLogin.json()) as {
    token: string
    refresh_token: string
  }
  check(
    'login devuelve par token + refresh_token',
    freshLogin.status === 200 && !!pair.token && !!pair.refresh_token,
    { status: freshLogin.status, hasToken: !!pair.token, hasRefresh: !!pair.refresh_token }
  )

  const rotated = await api('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: pair.refresh_token }),
  })
  const rotatedPair = (await rotated.json()) as {
    token: string
    refresh_token: string
  }
  check(
    'refresh rota el par',
    rotated.status === 200 &&
      !!rotatedPair.token &&
      !!rotatedPair.refresh_token &&
      rotatedPair.refresh_token !== pair.refresh_token,
    rotated.status
  )

  const replay = await api('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: pair.refresh_token }),
  })
  check('replay del refresh viejo -> 401', replay.status === 401, replay.status)

  const misuse = await api('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: rotatedPair.token }),
  })
  check('access como refresh -> 401', misuse.status === 401, misuse.status)

  const missing = await api('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({}),
  })
  check('refresh sin campo -> 400', missing.status === 400, missing.status)

  const logout = await api('/auth/logout', { method: 'POST' }, buyer.token)
  check(
    'logout con token responde ok',
    logout.status === 200 && (await logout.json()).status === 'ok'
  )

  summary()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})