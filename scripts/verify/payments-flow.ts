import {
  api,
  check,
  createCar,
  isoDaysFromNow,
  registerOrLogin,
  registerOrLoginAdmin,
  summary,
} from './_helpers'

async function main() {
  const stamp = Date.now()
  const seller = await registerOrLogin(
    `vende_pay_${stamp}@example.com`,
    'secret123',
    '+50581234567'
  )
  const buyer = await registerOrLogin(
    `compra_pay_${stamp}@example.com`,
    'secret123'
  )
  const admin = await registerOrLoginAdmin()
  check('login buyer, seller y admin entregan token', !!buyer.token && !!seller.token && !!admin.token)

  const car = await createCar(seller.token, `pago_${stamp}`, {
    price_per_day: 45000,
  })
  check('POST /seller/cars crea auto activo', car.id > 0 && car.active === true, car)

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

  const payment = await api(
    `/reservations/${created.id}/payment`,
    {
      method: 'POST',
      body: JSON.stringify({
        method: 'pos',
        proof_url: 'https://example.com/boleta.pdf',
      }),
    },
    buyer.token
  )
  const paid = (await payment.json()) as {
    id: number
    reservation_id: number
    method: string
    status: string
  }
  check(
    'POST /reservations/{id}/payment -> 201 pending',
    payment.status === 201 &&
      paid.status === 'pending' &&
      paid.method === 'pos' &&
      paid.reservation_id === created.id,
    paid
  )

  const dup = await api(
    `/reservations/${created.id}/payment`,
    { method: 'POST', body: JSON.stringify({ method: 'cash' }) },
    buyer.token
  )
  check('pago duplicado con la reserva pendiente -> 409', dup.status === 409)

  const cancelAfterPay = await api(
    `/reservations/${created.id}/cancel`,
    { method: 'PATCH' },
    buyer.token
  )
  check('cancelar con pago registrado -> 409', cancelAfterPay.status === 409)

  // El vendedor decide sobre la solicitud sin exigir el pago; el admin valida
  // el pago después. Es el flujo en dos pasos.
  const accept = await api(
    `/seller/reservations/${created.id}/accept`,
    { method: 'PATCH' },
    seller.token
  )
  const accepted = (await accept.json()) as {
    status: string
    payment?: { status: string }
  }
  check(
    'PATCH /seller/reservations/{id}/accept -> accepted con el pago intacto',
    accept.status === 200 &&
      accepted.status === 'accepted' &&
      accepted.payment?.status === 'pending',
    accepted
  )

  const acceptAgain = await api(
    `/seller/reservations/${created.id}/accept`,
    { method: 'PATCH' },
    seller.token
  )
  check('aceptar una reserva ya aceptada -> 409', acceptAgain.status === 409)

  const buyerCancelAccepted = await api(
    `/reservations/${created.id}/cancel`,
    { method: 'PATCH' },
    buyer.token
  )
  check(
    'el comprador no puede cancelar una reserva aceptada -> 409',
    buyerCancelAccepted.status === 409
  )

  const confirm = await api(
    `/admin/reservations/${created.id}/confirm`,
    { method: 'PATCH' },
    admin.token
  )
  const confirmed = (await confirm.json()) as {
    status: string
    payment?: { status: string }
  }
  check(
    'PATCH /admin/reservations/{id}/confirm -> confirmed + approved',
    confirm.status === 200 &&
      confirmed.status === 'confirmed' &&
      confirmed.payment?.status === 'approved',
    confirmed
  )

  const detail = await api(`/reservations/${created.id}`, {}, buyer.token)
  const detailBody = (await detail.json()) as {
    id: number
    status: string
    payment?: { status: string }
  }
  check(
    'GET /reservations/{id} como dueño -> confirmed + approved',
    detail.status === 200 &&
      detailBody.id === created.id &&
      detailBody.status === 'confirmed' &&
      detailBody.payment?.status === 'approved',
    detailBody
  )

  const sellerDetail = await api(`/reservations/${created.id}`, {}, seller.token)
  check(
    'GET /reservations/{id} como vendedor dueño -> 200',
    sellerDetail.status === 200
  )

  // La confirmación del admin exige aceptación previa y un pago pendiente.
  const noPayStart = isoDaysFromNow(5)
  const noPayEnd = isoDaysFromNow(6)
  const noPayRes = await api(
    '/reservations',
    {
      method: 'POST',
      body: JSON.stringify({
        car_id: car.id,
        start_date: noPayStart,
        end_date: noPayEnd,
      }),
    },
    buyer.token
  )
  const noPay = (await noPayRes.json()) as { id: number }
  const confirmNoPayment = await api(
    `/admin/reservations/${noPay.id}/confirm`,
    { method: 'PATCH' },
    admin.token
  )
  check('confirmar sin aceptar -> 409', confirmNoPayment.status === 409)

  const acceptNoPayment = await api(
    `/seller/reservations/${noPay.id}/accept`,
    { method: 'PATCH' },
    seller.token
  )
  check(
    'aceptar sin pago registrado -> 200 (decide la solicitud, no el pago)',
    acceptNoPayment.status === 200
  )
  const confirmStillNoPayment = await api(
    `/admin/reservations/${noPay.id}/confirm`,
    { method: 'PATCH' },
    admin.token
  )
  check(
    'confirmar aceptada sin pago -> 409 no payment recorded',
    confirmStillNoPayment.status === 409
  )

  // Rechazo del vendedor: la reserva queda rejected y el pago pendiente cae.
  const rejectStart = isoDaysFromNow(8)
  const rejectEnd = isoDaysFromNow(9)
  const rejectRes = await api(
    '/reservations',
    {
      method: 'POST',
      body: JSON.stringify({
        car_id: car.id,
        start_date: rejectStart,
        end_date: rejectEnd,
      }),
    },
    buyer.token
  )
  const rejectCreated = (await rejectRes.json()) as { id: number }
  const rejectPay = await api(
    `/reservations/${rejectCreated.id}/payment`,
    { method: 'POST', body: JSON.stringify({ method: 'cash' }) },
    buyer.token
  )
  check('reserva lista para rechazo: pago registrado', rejectPay.status === 201)

  const reject = await api(
    `/seller/reservations/${rejectCreated.id}/reject`,
    { method: 'PATCH' },
    seller.token
  )
  const rejected = (await reject.json()) as {
    status: string
    payment?: { status: string }
  }
  check(
    'PATCH /seller/reservations/{id}/reject -> rejected + pago rejected',
    reject.status === 200 &&
      rejected.status === 'rejected' &&
      rejected.payment?.status === 'rejected',
    rejected
  )

  const rejectAgain = await api(
    `/seller/reservations/${rejectCreated.id}/reject`,
    { method: 'PATCH' },
    seller.token
  )
  check('rechazar una reserva ya rechazada -> 409', rejectAgain.status === 409)

  const buyerCancelRejected = await api(
    `/reservations/${rejectCreated.id}/cancel`,
    { method: 'PATCH' },
    buyer.token
  )
  check(
    'el comprador no puede cancelar una reserva rechazada -> 409',
    buyerCancelRejected.status === 409
  )

  const rebookStart = isoDaysFromNow(8)
  const rebookEnd = isoDaysFromNow(9)
  const rebook = await api(
    '/reservations',
    {
      method: 'POST',
      body: JSON.stringify({
        car_id: car.id,
        start_date: rebookStart,
        end_date: rebookEnd,
      }),
    },
    buyer.token
  )
  const rebooked = (await rebook.json()) as { id: number }
  check('rechazar libera las fechas -> 201', rebook.status === 201)

  const rejectWithoutPayment = await api(
    `/seller/reservations/${rebooked.id}/reject`,
    { method: 'PATCH' },
    seller.token
  )
  const rejectWithoutPaymentBody = (await rejectWithoutPayment.json()) as {
    status: string
    payment?: unknown
  }
  check(
    'rechazar sin pago registrado -> 200 (el vendedor decide la solicitud)',
    rejectWithoutPayment.status === 200 &&
      rejectWithoutPaymentBody.status === 'rejected' &&
      rejectWithoutPaymentBody.payment === undefined,
    rejectWithoutPaymentBody
  )

  // Loop de corrección: el admin devuelve el comprobante y el comprador lo
  // vuelve a enviar sin reservar de nuevo.
  const wrongStart = isoDaysFromNow(11)
  const wrongEnd = isoDaysFromNow(12)
  const wrongRes = await api(
    '/reservations',
    {
      method: 'POST',
      body: JSON.stringify({
        car_id: car.id,
        start_date: wrongStart,
        end_date: wrongEnd,
      }),
    },
    buyer.token
  )
  const wrong = (await wrongRes.json()) as { id: number }
  await api(
    `/reservations/${wrong.id}/payment`,
    {
      method: 'POST',
      body: JSON.stringify({
        method: 'pos',
        proof_url: 'https://example.com/borroso.pdf',
      }),
    },
    buyer.token
  )
  await api(
    `/seller/reservations/${wrong.id}/accept`,
    { method: 'PATCH' },
    seller.token
  )
  const correction = await api(
    `/admin/reservations/${wrong.id}/request-correction`,
    { method: 'PATCH' },
    admin.token
  )
  const correctionBody = (await correction.json()) as {
    status: string
    payment?: { status: string }
  }
  check(
    'request-correction -> accepted con el pago rejected',
    correction.status === 200 &&
      correctionBody.status === 'accepted' &&
      correctionBody.payment?.status === 'rejected',
    correctionBody
  )

  const retry = await api(
    `/reservations/${wrong.id}/payment`,
    {
      method: 'POST',
      body: JSON.stringify({
        method: 'cash',
        proof_url: 'https://example.com/nitido.pdf',
      }),
    },
    buyer.token
  )
  const retryBody = (await retry.json()) as { status: string; method: string }
  check(
    're-enviar el comprobante -> 200 (no 201) y vuelve a pending',
    retry.status === 200 &&
      retryBody.status === 'pending' &&
      retryBody.method === 'cash',
    retryBody
  )

  const confirmCorrected = await api(
    `/admin/reservations/${wrong.id}/confirm`,
    { method: 'PATCH' },
    admin.token
  )
  const correctedBody = (await confirmCorrected.json()) as { status: string }
  check(
    'confirmar la reserva corregida -> confirmed',
    confirmCorrected.status === 200 && correctedBody.status === 'confirmed'
  )

  const otherSeller = await registerOrLogin(
    `vende2_${stamp}@example.com`,
    'secret123',
    '+50581234567'
  )
  const lonelyCar = await createCar(otherSeller.token, `ajeno_${stamp}`)
  const foreignPatch = await api(
    `/seller/cars/${lonelyCar.id}`,
    { method: 'PATCH', body: JSON.stringify({ active: false }) },
    seller.token
  )
  check('PATCH auto ajeno sin reservas -> 404', foreignPatch.status === 404)

  const buyerWrite = await api(
    '/seller/cars',
    { method: 'POST', body: JSON.stringify({ name: 'ajeno' }) },
    buyer.token
  )
  check('buyer POST /seller/cars -> 403', buyerWrite.status === 403)

  const filtered = await api(
    `/cars?start_date=${start}&end_date=${end}`,
    {},
    undefined
  )
  const filteredBody = (await filtered.json()) as { id: number }[]
  check(
    'GET /cars con fechas excluye reservado',
    filtered.status === 200 &&
      Array.isArray(filteredBody) &&
      !filteredBody.some((c) => c.id === car.id),
    { count: filteredBody.length }
  )

  summary()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
