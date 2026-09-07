import axios from 'axios'
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? ''
      if (!url.includes('/auth/login')) {
        await useAuthStore.getState().clearAuth()
        router.replace('/(auth)/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api
