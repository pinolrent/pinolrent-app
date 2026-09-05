import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import type { User } from '@/types/auth'

const TOKEN_KEY = 'pinolrent_token'
const USER_KEY = 'pinolrent_user'

interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  setUser: (user: User) => void
  clearAuth: () => void
  loadFromStorage: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,

  setAuth: (token, user) => {
    SecureStore.setItem(TOKEN_KEY, token)
    SecureStore.setItem(USER_KEY, JSON.stringify(user))
    set({ token, user })
  },

  setUser: (user) => {
    SecureStore.setItem(USER_KEY, JSON.stringify(user))
    set({ user })
  },

  clearAuth: () => {
    SecureStore.deleteItemAsync(TOKEN_KEY)
    SecureStore.deleteItemAsync(USER_KEY)
    set({ token: null, user: null })
  },

  loadFromStorage: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY)
    const userJson = await SecureStore.getItemAsync(USER_KEY)
    const user = userJson ? JSON.parse(userJson) as User : null
    set({ token, user })
  },
}))
