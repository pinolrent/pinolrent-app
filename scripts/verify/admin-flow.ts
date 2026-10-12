import {
  ADMIN_EMAIL,
  api,
  check,
  createCar,
  isoDaysFromNow,
  registerOrLogin,
  registerOrLoginAdmin,
  summary,
} from './_helpers'

interface ListResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

async function main() {
  const stamp = Date.now()
  const admin = await registerOrLoginAdmin()
  check(`login de ${ADMIN_EMAIL} entrega token admin`, !!admin.token)

  const adminMe = await api('/auth/me', {}, admin.token)
  const adminBody = (await adminMe.json()) as { id: number; roles: string[] }
  check(
    'la cuenta del allow-list es admin y también buyer',
    adminMe.status === 200 &&
      adminBody.roles.includes('admin') &&
      adminBody.roles.includes('buyer'),
    adminBody
  )

  const stats = await api('/admin/stats', {}, admin.token)
  const statsBody = (await stats.json()) as {
    users: { total: number; sellers: number; admins: number; suspended: number }
    cars: { active: number }
    reservations: Record<string, number>
    payments: { approved_total: number }
  }
  check(
    'GET /admin/stats -> 200 con los cuatro grupos',
    stats.status === 200 &&
      typeof statsBody.users?.total === 'number' &&
      typeof statsBody.users?.sellers === 'number' &&
      typeof statsBody.reservations?.pending === 'number' &&
      typeof statsBody.payments?.approved_total === 'number',
    statsBody
  )

  const tamperedChar = admin.token.slice(-1) === 'x' ? 'y' : 'x'
  const forbidden = await api(
    '/admin/stats',
    {},
    admin.token.slice(0, -1) + tamperedChar
  )
  check('token inválido en /admin/stats -> 401', forbidden.status === 401)

  // Suspender y reactivar una cuenta, y lo que ve esa cuenta mientras tanto.
  const buyer = await registerOrLogin(
    `admin_buyer_${stamp}@example.com`,
    'secret123'
  )
  const buyerMe = await api('/auth/me', {}, buyer.token)
  const buyerBody = (await buyerMe.json()) as { id: number }
  check('buyer de prueba creado', buyerMe.status === 200 && buyerBody.id > 0)

  const buyerList = await api(
    `/admin/users?q=${buyerBody.id}`,
    {},
    admin.token
  )
  const buyerListBody = (await buyerList.json()) as ListResponse<{
    id: number
    email: string
    phone?: string
  }>
  check(
    'GET /admin/users?q=<id> -> envoltura items/total con la cuenta',
    buyerList.status === 200 &&
      typeof buyerListBody.total === 'number' &&
      buyerListBody.items.some((item) => item.id === buyerBody.id),
    buyerListBody
  )

  const badFilter = await api(
    '/admin/users?role=nope',
    {},
    admin.token
  )
  check('GET /admin/users?role inválido -> 400', badFilter.status === 400)

  const suspend = await api(
    `/admin/users/${buyerBody.id}`,
    { method: 'PATCH', body: JSON.stringify({ suspended: true }) },
    admin.token
  )
  const suspendBody = (await suspend.json()) as { suspended_at?: number }
  check(
    'PATCH /admin/users/{id} suspende -> 200 con suspended_at',
    suspend.status === 200 && typeof suspendBody.suspended_at === 'number',
    suspendBody
  )

  const blocked = await api('/auth/me', {}, buyer.token)
  const blockedBody = (await blocked.json()) as { error?: string }
  check(
    'la cuenta suspendida recibe 403 account suspended',
    blocked.status === 403 && blockedBody.error === 'account suspended',
    blockedBody
  )

  const selfSuspend = await api(
    `/admin/users/${adminBody.id}`,
    { method: 'PATCH', body: JSON.stringify({ suspended: true }) },
    admin.token
  )
  check('suspenderse a sí mismo -> 400', selfSuspend.status === 400)

  const reactivate = await api(
    `/admin/users/${buyerBody.id}`,
    { method: 'PATCH', body: JSON.stringify({ suspended: false }) },
    admin.token
  )
  const reactivateBody = (await reactivate.json()) as {
    suspended_at?: number
  }
  check(
    'reactivar -> 200 sin suspended_at',
    reactivate.status === 200 && reactivateBody.suspended_at === undefined,
    reactivateBody
  )

  const unblocked = await api('/auth/me', {}, buyer.token)
  check(
    'la cuenta reactivada recupera el acceso sin volver a entrar -> 200',
    unblocked.status === 200
  )

  // Roles de vendedor: el teléfono es requisito y las reservas futuras
  // bloquean la revocación.
  const grantNoPhone = await api(
    `/admin/users/${buyerBody.id}/roles`,
    { method: 'PATCH', body: JSON.stringify({ seller: true }) },
    admin.token
  )
  check(
    'dar vendedor sin teléfono -> 409 user has no phone number',
    grantNoPhone.status === 409
  )

  const seller = await registerOrLogin(
    `admin_seller_${stamp}@example.com`,
    'secret123',
    '+50581234567'
  )
  const sellerMe = await api('/auth/me', {}, seller.token)
  const sellerBody = (await sellerMe.json()) as { id: number; roles: string[] }
  check(
    'vendedor de prueba con teléfono',
    sellerMe.status === 200 && sellerBody.roles.includes('seller')
  )

  const revoke = await api(
    `/admin/users/${sellerBody.id}/roles`,
    { method: 'PATCH', body: JSON.stringify({ seller: false }) },
    admin.token
  )
  const revokeBody = (await revoke.json()) as { roles: string[] }
  check(
    'PATCH /admin/users/{id}/roles quita vendedor -> 200',
    revoke.status === 200 && !revokeBody.roles.includes('seller'),
    revokeBody
  )

  const grant = await api(
    `/admin/users/${sellerBody.id}/roles`,
    { method: 'PATCH', body: JSON.stringify({ seller: true }) },
    admin.token
  )
  const grantBody = (await grant.json()) as { roles: string[] }
  check(
    'volver a dar vendedor con teléfono -> 200',
    grant.status === 200 && grantBody.roles.includes('seller'),
    grantBody
  )

  const car = await createCar(seller.token, `admin_${stamp}`, {
    price_per_day: 40000,
  })
  check('auto del vendedor creado', car.id > 0 && car.active === true, car)

  const liveReservation = await api(
    '/reservations',
    {
      method: 'POST',
      body: JSON.stringify({
        car_id: car.id,
        start_date: isoDaysFromNow(3),
        end_date: isoDaysFromNow(4),
      }),
    },
    buyer.token
  )
  check(
    'reserva futura sobre el auto del vendedor -> 201',
    liveReservation.status === 201
  )

  const revokeWithReservations = await api(
    `/admin/users/${sellerBody.id}/roles`,
    { method: 'PATCH', body: JSON.stringify({ seller: false }) },
    admin.token
  )
  const revokeWithBody = (await revokeWithReservations.json()) as {
    error?: string
  }
  check(
    'quitar vendedor con reservas futuras -> 409',
    revokeWithReservations.status === 409 &&
      revokeWithBody.error === 'user has future reservations, cannot revoke seller',
    revokeWithBody
  )

  // Autos: el admin ve los inactivos, puede desactivar con reservas vivas y
  // no puede borrar con historial.
  const sellerEmail = `admin_seller_${stamp}@example.com`
  const cars = await api(`/admin/cars?q=${car.id}`, {}, admin.token)
  const carsBody = (await cars.json()) as ListResponse<{
    id: number
    owner_email?: string
  }>
  check(
    'GET /admin/cars?q=<id> -> el auto con owner_email resuelto',
    cars.status === 200 &&
      typeof carsBody.total === 'number' &&
      carsBody.items.some(
        (item) => item.id === car.id && item.owner_email === sellerEmail
      ),
    carsBody.items[0]
  )

  const deactivate = await api(
    `/admin/cars/${car.id}`,
    { method: 'PATCH', body: JSON.stringify({ active: false }) },
    admin.token
  )
  check(
    'PATCH /admin/cars/{id} desactiva con reservas futuras -> 200',
    deactivate.status === 200
  )

  const deleteWithReservations = await api(
    `/admin/cars/${car.id}`,
    { method: 'DELETE' },
    admin.token
  )
  check(
    'DELETE /admin/cars/{id} con reservas -> 409',
    deleteWithReservations.status === 409
  )

  const spare = await createCar(seller.token, `admin_spare_${stamp}`)
  const deleteSpare = await api(
    `/admin/cars/${spare.id}`,
    { method: 'DELETE' },
    admin.token
  )
  check('DELETE /admin/cars/{id} sin reservas -> 200', deleteSpare.status === 200)

  // Reservas: filtros y contexto resuelto.
  const reservations = await api(
    `/admin/reservations?status=pending&car_id=${car.id}`,
    {},
    admin.token
  )
  const reservationsBody = (await reservations.json()) as ListResponse<{
    status: string
    buyer_email?: string
    car_name?: string
  }>
  check(
    'GET /admin/reservations?status=pending&car_id -> items con buyer_email y car_name',
    reservations.status === 200 &&
      reservationsBody.items.every((item) => item.status === 'pending') &&
      reservationsBody.items.every((item) => Boolean(item.buyer_email) && Boolean(item.car_name)),
    reservationsBody.items[0]
  )

  const badStatus = await api(
    '/admin/reservations?status=nope',
    {},
    admin.token
  )
  check('GET /admin/reservations?status inválido -> 400', badStatus.status === 400)

  const payments = await api('/admin/payments?limit=5', {}, admin.token)
  const paymentsBody = (await payments.json()) as ListResponse<{
    id: number
    method: string
    status: string
  }>
  check(
    'GET /admin/payments -> envoltura con items',
    payments.status === 200 && Array.isArray(paymentsBody.items),
    { total: paymentsBody.total }
  )

  const badPaymentFilter = await api(
    '/admin/payments?status=nope',
    {},
    admin.token
  )
  check('GET /admin/payments?status inválido -> 400', badPaymentFilter.status === 400)

  // Auditoría: las decisiones de este mismo flujo tienen que estar.
  const audit = await api('/admin/audit?limit=20', {}, admin.token)
  const auditBody = (await audit.json()) as ListResponse<{
    action: string
    actor_id: number
    created_at: string
  }>
  check(
    'GET /admin/audit -> 200 con movimientos',
    audit.status === 200 && auditBody.items.length > 0,
    { total: auditBody.total }
  )

  const suspendAudit = await api(
    '/admin/audit?action=user.suspend',
    {},
    admin.token
  )
  const suspendAuditBody = (await suspendAudit.json()) as ListResponse<{
    action: string
  }>
  check(
    'GET /admin/audit?action=user.suspend -> solo esa acción',
    suspendAudit.status === 200 &&
      suspendAuditBody.items.length > 0 &&
      suspendAuditBody.items.every((item) => item.action === 'user.suspend'),
    { total: suspendAuditBody.total }
  )

  // Un buyer sin rol admin no entra a ninguna ruta de administración.
  const buyerStats = await api('/admin/stats', {}, buyer.token)
  const buyerStatsBody = (await buyerStats.json()) as { error?: string }
  check(
    'buyer en /admin/stats -> 403 insufficient permissions',
    buyerStats.status === 403 &&
      buyerStatsBody.error === 'insufficient permissions',
    buyerStatsBody
  )

  const buyerAudit = await api('/admin/audit', {}, buyer.token)
  check('buyer en /admin/audit -> 403', buyerAudit.status === 403)

  // El auto quedó desactivado y su reserva futura sigue viva.
  const inactiveCar = await api('/cars?limit=200', {}, undefined)
  const inactiveBody = (await inactiveCar.json()) as { id: number }[]
  check(
    'el auto desactivado no aparece en el catálogo público',
    inactiveCar.status === 200 && !inactiveBody.some((item) => item.id === car.id)
  )

  summary()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
