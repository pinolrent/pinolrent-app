import {
  api,
  check,
  createCar,
  isoDaysFromNow,
  registerOrLogin,
  summary,
} from './_helpers'

interface Notification {
  id: number
  kind: string
  reservation_id: number
  read: boolean
}

async function main() {
  const stamp = Date.now()
  const seller = await registerOrLogin(
    `vende_${stamp}@example.com`,
    'secret123',
    '+50581234567'
  )
  const buyer = await registerOrLogin(
    `compra_${stamp}@example.com`,
    'secret123'
  )
  check('login buyer y seller entregan token', !!buyer.token && !!seller.token)

  const car = await createCar(seller.token, `notif_${stamp}`)
  check('auto creado', car.id > 0 && car.active === true, car)

  // El buyer reserva -> el seller recibe reservation.requested.
  const start = isoDaysFromNow(1)
  const end = isoDaysFromNow(3)
  const res = await api(
    '/reservations',
    {
      method: 'POST',
      body: JSON.stringify({
        car_id: car.id,
        start_date: start,
        end_date: end,
      }),
    },
    buyer.token
  )
  const created = (await res.json()) as { id: number }
  check(
    'POST /reservations -> 201',
    res.status === 201 && created.id > 0,
    created
  )

  const unread = await api('/notifications?unread=true', {}, seller.token)
  const unreadBody = (await unread.json()) as Notification[]
  check(
    'GET /notifications?unread=true al seller trae reservation.requested con el reservation_id y read=false',
    unread.status === 200 &&
      Array.isArray(unreadBody) &&
      unreadBody.some(
        (n) =>
          n.kind === 'reservation.requested' &&
          n.reservation_id === created.id &&
          n.read === false
      ),
    unreadBody
  )

  const requestedNotif = unreadBody.find(
    (n) =>
      n.kind === 'reservation.requested' && n.reservation_id === created.id
  )
  check('la notificación buscada existe para marcar', !!requestedNotif, requestedNotif)
  if (!requestedNotif) {
    summary()
    return
  }

  // PATCH /notifications/{id}/read es idempotente: 200 con read=true siempre.
  const read = await api(
    `/notifications/${requestedNotif.id}/read`,
    { method: 'PATCH' },
    seller.token
  )
  const readBody = (await read.json()) as { read: boolean }
  check(
    'PATCH /notifications/{id}/read -> 200 read:true',
    read.status === 200 && readBody.read === true,
    readBody
  )

  const readAgain = await api(
    `/notifications/${requestedNotif.id}/read`,
    { method: 'PATCH' },
    seller.token
  )
  check('PATCH repetido -> 200 idempotent', readAgain.status === 200)

  const stillUnread = await api(
    '/notifications?unread=true',
    {},
    seller.token
  )
  const stillBody = (await stillUnread.json()) as Notification[]
  check(
    'después de leer, desaparece de unread=true',
    stillUnread.status === 200 &&
      !stillBody.some((n) => n.id === requestedNotif.id)
  )

  // Otro usuario no puede marcar una notificación que no es suya -> 404.
  const cross = await api(
    `/notifications/${requestedNotif.id}/read`,
    { method: 'PATCH' },
    buyer.token
  )
  check('otro usuario marca la notificación -> 404', cross.status === 404)

  // Parámetros inválidos -> 400.
  const badUnread = await api('/notifications?unread=maybe', {}, seller.token)
  check('GET /notifications?unread=maybe -> 400', badUnread.status === 400)

  const badId = await api(
    '/notifications/abc/read',
    { method: 'PATCH' },
    seller.token
  )
  check('PATCH /notifications/abc/read -> 400', badId.status === 400)

  // El seller acepta -> el buyer recibe reservation.accepted.
  const accept = await api(
    `/seller/reservations/${created.id}/accept`,
    { method: 'PATCH' },
    seller.token
  )
  check('seller acepta -> 200', accept.status === 200)

  const buyerUnread = await api('/notifications?unread=true', {}, buyer.token)
  const buyerBody = (await buyerUnread.json()) as Notification[]
  check(
    'el buyer tiene reservation.accepted sin leer',
    buyerUnread.status === 200 &&
      buyerBody.some(
        (n) =>
          n.kind === 'reservation.accepted' &&
          n.reservation_id === created.id &&
          n.read === false
      ),
    buyerBody
  )

  summary()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
