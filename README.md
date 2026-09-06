# Pinol Rent

App para renta de vehiculos (Expo + React Native + TypeScript).

## Setup

```sh
NODE_ENV=development npm install
cp .env.example .env   # EXPO_PUBLIC_API_URL=http://localhost:8080
```

## Run

```sh
npm start        # expo start (elegir android/ios/web)
npm run android
npm run web
```

## Checks

```sh
npm run typecheck   # tsc --noEmit, puerta antes de cada commit
npm run verify      # typecheck + los 5 flows (requiere API en EXPO_PUBLIC_API_URL)
npm run verify:auth | verify:cars | verify:reservations | verify:payments | verify:seller
```

Los flows usan usuarios únicos con auto-registro, funcionan contra una DB fresca.
