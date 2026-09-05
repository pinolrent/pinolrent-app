import api from './api'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '@/types/auth'

export const authService = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    api.post<RegisterResponse>('/auth/register', data).then((r) => r.data),

  registerSeller: (data: RegisterRequest) =>
    api.post<RegisterResponse>('/auth/register/seller', data).then((r) => r.data),

  logout: () =>
    api.post<{ status: string }>('/auth/logout').then((r) => r.data),

  me: (token?: string) => {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {}
    return api.get<User>('/auth/me', config).then((r) => r.data)
  },
}
