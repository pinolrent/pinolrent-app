export type Role = 'buyer' | 'seller'

export interface User {
  id: number
  email: string
  roles: Role[]
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

// Una sola cuenta por email: con teléfono nace vendedora.
export interface RegisterRequest {
  email: string
  password: string
  phone?: string
}

export interface BecomeSellerRequest {
  phone: string
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

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}
