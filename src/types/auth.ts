export interface User {
  id: number
  email: string
  role: 'buyer' | 'seller'
  phone?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  refresh_token: string
}

export interface RegisterRequest {
  email: string
  password: string
  phone?: string
  role?: 'buyer' | 'seller'
}

export interface RefreshRequest {
  refresh_token: string
}

export interface RefreshResponse {
  token: string
  refresh_token: string
}

export interface RegisterResponse {
  email: string
}

export interface UpdateProfileRequest {
  phone: string
}
