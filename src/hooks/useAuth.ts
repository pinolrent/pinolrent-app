import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth.service'
import { queryKeys } from '@/constants/query-keys'

interface LoginInput {
  email: string
  password: string
}

interface RegisterInput {
  email: string
  password: string
  phone?: string
  role: 'buyer' | 'seller'
}

export function useAuth() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isLoaded = useAuthStore((s) => s.isLoaded)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const login = useMutation({
    mutationFn: async ({ email, password }: LoginInput) => {
      const { token, refresh_token } = await authService.login({
        email,
        password,
      })
      const user = await authService.me(token)
      return { token, refreshToken: refresh_token, user }
    },
    onSuccess: async ({ token, refreshToken, user }) => {
      await setAuth(token, refreshToken, user)
      router.replace(
        user.role === 'seller'
          ? '/(authenticated)/(seller)'
          : '/(authenticated)/(buyer)'
      )
    },
  })

  const register = useMutation({
    mutationFn: async ({ email, password, phone, role }: RegisterInput) => {
      const payload = phone ? { email, password, phone } : { email, password }
      if (role === 'seller') {
        await authService.registerSeller(payload)
      } else {
        await authService.register(payload)
      }
      const { token, refresh_token } = await authService.login({
        email,
        password,
      })
      const user = await authService.me(token)
      return { token, refreshToken: refresh_token, user }
    },
    onSuccess: async ({ token, refreshToken, user }) => {
      await setAuth(token, refreshToken, user)
      router.replace(
        user.role === 'seller'
          ? '/(authenticated)/(seller)'
          : '/(authenticated)/(buyer)'
      )
    },
  })

  const logout = useMutation({
    mutationFn: async () => {
      try {
        await authService.logout()
      } catch {
        // fire-and-forget: la limpieza local ocurre de todos modos
      }
    },
    onSettled: async () => {
      await clearAuth()
      router.replace('/(auth)/login')
    },
  })

  return {
    user,
    token,
    isLoaded,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    useUpdateProfile,
  }
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (phone: string) => authService.updateProfile({ phone }),
    onSuccess: (user) => {
      useAuthStore.getState().setUser(user)
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations })
    },
  })
}
