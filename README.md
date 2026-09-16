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

## Build

Genera el APK instalable y el app bundle para Play Store desde GitHub Actions
(`.github/workflows/build-release.yml`), con disparo manual. La compilación corre en el runner
(`eas build --local`), así que no consume minutos de EAS.

**Una sola vez, antes del primer build:**

```sh
npm install -g eas-cli@18   # o usá npx eas-cli@18 en cada comando
eas login                   # cuenta de expo.dev
eas init                    # escribe el projectId real en app.json: commiteá ese cambio
eas credentials -p android  # generá el keystore y dejaselo a EAS
```

Después cargá dos secrets en GitHub → Settings → Secrets and variables → Actions:

| Secret | Valor |
|---|---|
| `EXPO_TOKEN` | expo.dev → Account settings → Access tokens |
| `EXPO_PUBLIC_API_URL` | la URL **https** de la API |

**Cada release:**

```sh
gh workflow run build-release.yml
```

Al terminar quedan el `.apk` y el `.aab` como artifacts de la corrida y un Release en borrador con
tag `v<version>` y los dos archivos adjuntos.

**En tu máquina**, sólo si tenés JDK 17 y el SDK de Android:

```sh
EXPO_PUBLIC_API_URL=https://tu-api.com npm run build:apk   # o npm run build:aab
```

Notas:

- `EXPO_PUBLIC_API_URL` **se embebe en el bundle** en tiempo de compilación. No es un secreto
  (cualquiera puede leerla en el APK) y tiene que ser `https`, porque `src/constants/config.ts`
  aborta al arrancar si no lo es. El workflow falla temprano si falta o no empieza con `https://`.
- `app.json` y `package.json` comparten versión; el workflow lo valida. Para un release subí las dos
  y `android.versionCode`.
- `/android` e `/ios` son generados por `expo prebuild`: no se commitean ni se editan a mano.
