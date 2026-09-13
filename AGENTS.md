# AGENTS.md

## Project overview

PinolRent app — P2P car rental client for pinolrent-api. Sellers publish cars, buyers reserve and pay.
Expo ~55 + React Native 0.83 + React 19.2 + TypeScript strict, `expo-router` entry.

```
app/                 # expo-router routes: index gate, (auth), (authenticated)/(buyer|seller)
src/
  services/          # thin axios wrappers per domain (auth, cars, reservations, payments, seller-cars)
  hooks/             # react-query wrappers per domain (useAuth, useCars, useReservations, ...)
  stores/            # zustand global state only: auth.store, theme.store
  types/             # API contracts mirroring backend snake_case (auth, car, reservation, payment, api)
  components/        # shared UI: ui-kit, ScreenShell, ErrorBoundary, fields
  constants/         # config, query-keys, reservation-ui, payment-ui
  utils/             # errors, currency, dates, storage
scripts/verify/      # E2E flows against a live API (_helpers + auth/cars/reservations/payments/seller-manage)
components/ui/       # gluestack generated primitives
```

Docs and UI strings are in Spanish, code comments in English. Follow that convention.

## Setup

```sh
NODE_ENV=development npm install
cp .env.example .env   # EXPO_PUBLIC_API_URL=http://localhost:8080
```

Single env var: `EXPO_PUBLIC_API_URL`. `src/constants/config.ts` warns in dev when missing
and throws in prod when it is not `https://`.

## Build, test and lint

```sh
npm run typecheck   # tsc --noEmit, gate before every commit
npm run lint        # eslint ., expo flat config
npm test            # vitest run (unit: src/utils/*.test.ts)
npm start           # expo start (android/ios/web)
npm run verify      # typecheck + 5 flows, requires API at EXPO_PUBLIC_API_URL
npm run verify:auth | verify:cars | verify:reservations | verify:payments | verify:seller
```

Before every commit `typecheck + lint + test` must pass. Run the matching
`verify:*` flow when you touched `services/`, `hooks/`, `stores/auth` or `services/api.ts`;
run full `npm run verify` before opening a PR that changes data flow. Never commit with a red check.

## Adding a feature

New backend endpoint → new screen follows this order, nothing else:

1. `src/types/<domain>.ts` — add/extend the contract, keep backend `snake_case`.
2. `src/services/<domain>.service.ts` — thin wrapper: `api.get/post/patch(...).then(r => r.data)`. No query logic here.
3. `src/hooks/use<Domain>.ts` — `useQuery` for reads, `useMutation` + cache invalidation for writes.
4. `app/(authenticated)/(buyer|seller)/...` — screen using the hook, `ScreenShell` + `ui-kit` primitives.
5. Extend `src/constants/query-keys.ts` and `src/utils/errors.ts` (translation) when needed.

One domain per service/hook file. Never fetch from screens, never put HTTP in stores.

## API client and auth

`src/services/api.ts` owns the single axios instance: `baseURL = API_URL`, 15s timeout,
Bearer injection from `useAuthStore`, single-flight `refreshOnce()` against `/auth/refresh`,
logout + `router.replace('/(auth)/login')` on definitive 401. `/auth/login|refresh|register`
never retry.

Rules: always go through `api.ts`; never create another axios/fetch client in app code
(`scripts/verify` uses raw fetch by design). Never hand-roll refresh or token attach —
the only exception is the login/register → `me(token)` bootstrap in `useAuth`.
Token/user/refresh live in `useAuthStore` + `storage` (SecureStore native, localStorage web);
`loadFromStorage()` validates against `/auth/me` and tries one refresh before wiping.

## State and data

`QueryClient(staleTime 5min)` lives in `app/_layout.tsx`. Reads are `useQuery` keyed from
`queryKeys`; writes are `useMutation` invalidating every affected key
(see `invalidateReservationCaches` in `useReservations.ts`). Guard detail queries with
`enabled: Number.isFinite(id)`. Keep zustand for session/theme only — all server state
goes through react-query.

## Routing and roles

`app/index.tsx` gates by session: no token → `/(auth)/login`, `seller` → `/(authenticated)/(seller)`,
else buyer. `(authenticated)/_layout.tsx` enforces it with `Stack.Protected` per role plus an
invalid-session fallback. New screens go inside the matching `(buyer)`/`(seller)` group so they
inherit the guard; never check roles ad-hoc in screens when a group guard covers it.

## UI

Reuse `AppButton/AppCard/StatCard/FormError/EmptyState` from `src/components/ui-kit.tsx`,
layout via `ScreenShell` (max-width + `bg-background` padding), crash fallback via the root
`ErrorBoundary`. Style with uniwind `className` tokens (`bg-card`, `text-muted-foreground`, ...)
so dark mode (Uniwind theme from `theme.store`) keeps working; avoid one-off colors and raw
`StyleSheet` for themed surfaces. Images go through `resolveImageUrl` (`/uploads/*` resolves
against `API_URL`) and validate with `isImageUrl`.

## Errors and forms

Validate locally with `validateEmail/validatePassword/validatePhone` before hitting the API.
Render failures with `getApiErrorMessage(err, fallback)` — it maps offline/timeout/401/403/404/409/5xx
and translates known backend messages via `translateBackendMessage`. When the API gains a new
error string, add its translation there instead of handling it per screen. Keep all user-facing
copy in Spanish.

## Testing

* Unit: `src/utils/*.test.ts` run by `vitest`. Add/extend cases for every `utils/` change.
* Flows: `scripts/verify/*.ts` exercise the live API end to end with auto-registered unique users
(`registerOrLogin`), `isoDaysFromNow()` for dates — never hardcode calendar dates — and built-in
retry on `429`. `check`/`summary` report pass/fail with non-zero exit. Helpers live in `_helpers.ts`.
* CI (`.github/workflows/ci.yml`): `check` job (`typecheck + lint + test`) and `verify` job that boots
pinolrent-api from `main` on `:8132` and runs `npm run verify`.

## Commit and PR conventions

* Prefix: `feat:`, `fix:`, `docs:`, `build:`, `ci:`, `test:`, `style:`, `chore:`
* Keep commits focused — one area per commit. Split tooling/docs/CI/tests into separate commits.
* Commit body: describe what changed, no conversational context or chat references.
* No `Co-authored-by` trailer.
* Do not push directly to `main` — work on a branch and open a PR.
