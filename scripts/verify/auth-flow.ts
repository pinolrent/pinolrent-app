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
    'me(token explícito) devuelve el rol buyer',
    buyerMe.status === 200 &&
      Array.isArray(buyerMe.body.roles) &&
      buyerMe.body.roles.includes('buyer') &&
      !buyerMe.body.roles.includes('seller'),
    buyerMe.body
  )

  const seller = await registerOrLogin(`vende_${stamp}@example.com`, 'secret123', true, '+56912345678')
  const sellerMe = await me(seller.token)
  check('login seller devuelve token', !!seller.token)
  check(
    'me(token explícito) devuelve el rol seller',
    sellerMe.status === 200 &&
      Array.isArray(sellerMe.body.roles) &&
      sellerMe.body.roles.includes('seller'),
    sellerMe.body
  )

  const regBuyer = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: 'secret123' }),
  })
  check('register buyer responde 201', regBuyer.status === 201, regBuyer.status)

  // Una sola cuenta por email: el teléfono es lo que habilita vender.
  const regSell = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: SELLER_EMAIL, password: 'secret123', phone: '+56912345678' }),
  })
  check('register con telefono responde 201', regSell.status === 201, regSell.status)

  const sellerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: SELLER_EMAIL, password: 'secret123' }),
  })
  const sellerPair = (await sellerLogin.json()) as { token: string }
  const sellerProfile = await me(sellerPair.token)
  check(
    'una cuenta registrada con telefono nace vendedora',
    sellerProfile.body.roles?.includes('seller') === true,
    sellerProfile.body
  )

  const becomeNoPhone = await api(
    '/auth/become-seller',
    { method: 'POST', body: JSON.stringify({}) },
    sellerPair.token
  )
  check('become-seller sin telefono -> 400', becomeNoPhone.status === 400, becomeNoPhone.status)

  const becomeAgain = await api(
    '/auth/become-seller',
    { method: 'POST', body: JSON.stringify({ phone: '+56912345678' }) },
    sellerPair.token
  )
  check('become-seller es idempotente -> 200', becomeAgain.status === 200, becomeAgain.status)

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

  const buyerEmail = `compra_${stamp}@example.com`
  const relogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: buyerEmail, password: 'secret123' }),
  })
  const reloginPair = (await relogin.json()) as { token: string }
  check('re-login del comprador -> 200', relogin.status === 200 && !!reloginPair.token)

  // La comparación de iat contra token_valid_after es estricta y en segundos:
  // se cruza el borde de segundo como hace el demo de la API.
  await new Promise((r) => setTimeout(r, 1100))

  const changed = await api(
    '/auth/password',
    {
      method: 'PATCH',
      body: JSON.stringify({
        current_password: 'secret123',
        new_password: 'nuevaClave456',
      }),
    },
    reloginPair.token
  )
  check('PATCH /auth/password -> 200 ok', changed.status === 200, changed.status)

  const oldToken = await api('/auth/me', {}, reloginPair.token)
  check(
    'el token viejo deja de servir tras el cambio -> 401',
    oldToken.status === 401,
    oldToken.status
  )

  const loginOld = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: buyerEmail, password: 'secret123' }),
  })
  check('login con la contraseña vieja -> 401', loginOld.status === 401)

  const loginNew = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: buyerEmail, password: 'nuevaClave456' }),
  })
  const newPair = (await loginNew.json()) as { token: string }
  check(
    'login con la contraseña nueva -> 200',
    loginNew.status === 200 && !!newPair.token,
    loginNew.status
  )

  const wrongCurrent = await api(
    '/auth/password',
    {
      method: 'PATCH',
      body: JSON.stringify({
        current_password: 'incorrecta',
        new_password: 'otraClave789',
      }),
    },
    newPair.token
  )
  check(
    'cambio de contraseña con la actual incorrecta -> 401',
    wrongCurrent.status === 401,
    wrongCurrent.status
  )

  const shortNew = await api(
    '/auth/password',
    {
      method: 'PATCH',
      body: JSON.stringify({
        current_password: 'nuevaClave456',
        new_password: 'corta',
      }),
    },
    newPair.token
  )
  check('nueva contraseña corta -> 400', shortNew.status === 400, shortNew.status)

  summary()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
