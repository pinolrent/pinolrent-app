import axios, { type InternalAxiosRequestConfig } from 'axios'
import { router } from 'expo-router'
import { API_URL } from '@/constants/config'
import { useAuthStore } from '@/stores/auth.store'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const NO_RETRY_URLS = ['/auth/login', '/auth/refresh', '/auth/register']

let refreshPromise: Promise<void> | null = null

function refreshOnce(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = useAuthStore.getState().refreshToken
      if (!refreshToken) throw new Error('no refresh token')
      const pair = await axios
        .post<{ token: string; refresh_token: string }>(
          `${API_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        )
        .then((r) => r.data)
      await useAuthStore.getState().updateTokens(pair.token, pair.refresh_token)
    })().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined
    if (
      error.response?.status === 401 &&
      config &&
      !config._retry &&
      !NO_RETRY_URLS.some((u) => config.url?.includes(u))
    ) {
      config._retry = true
      try {
        await refreshOnce()
        config.headers.Authorization = `Bearer ${useAuthStore.getState().token}`
        return api(config)
      } catch {
        await useAuthStore.getState().clearAuth()
        router.replace('/(auth)/login')
      }
    } else if (error.response?.status === 401) {
      const url = error.config?.url ?? ''
      if (!NO_RETRY_URLS.some((u) => url.includes(u))) {
        await useAuthStore.getState().clearAuth()
        router.replace('/(auth)/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api
