import { api, check, createCar, registerOrLogin, summary } from './_helpers'

const STAMP = Date.now()

async function main() {
  const seller = await registerOrLogin(`vende_${Date.now()}@example.com`, 'secret123', true)
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

  summary()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})