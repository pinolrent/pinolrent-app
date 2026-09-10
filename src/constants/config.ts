export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080'

if (!process.env.EXPO_PUBLIC_API_URL && __DEV__) {
  console.warn(
    '[config] EXPO_PUBLIC_API_URL no definido, usando http://localhost:8080'
  )
}

if (!__DEV__ && API_URL.startsWith('http://')) {
  throw new Error(
    '[config] EXPO_PUBLIC_API_URL debe usar https:// en producción'
  )
}
