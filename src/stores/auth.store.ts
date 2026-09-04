import { create } from 'zustand'
import { storage } from '@/utils/storage'
import type { User } from '@/types/auth'

const TOKEN_KEY = 'pinolrent_token'
const USER_KEY = 'pinolrent_user'

interface AuthState {
  token: string | null
  user: User | null
  isLoaded: boolean
  setAuth: (token: string, user: User) => Promise<void>
  setUser: (user: User) => Promise<void>
  clearAuth: () => Promise<void>
  loadFromStorage: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoaded: false,

  setAuth: async (token, user) => {
    await storage.setItem(TOKEN_KEY, token)
    await storage.setItem(USER_KEY, JSON.stringify(user))
    set({ token, user })
  },

  setUser: async (user) => {
    await storage.setItem(USER_KEY, JSON.stringify(user))
    set({ user })
  },

  clearAuth: async () => {
    await storage.removeItem(TOKEN_KEY)
    await storage.removeItem(USER_KEY)
    set({ token: null, user: null })
  },

  loadFromStorage: async () => {
    try {
      const token = await storage.getItem(TOKEN_KEY)
      if (!token) {
        set({ isLoaded: true })
        return
      }
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      const user = (await res.json()) as User
      set({ token, user, isLoaded: true })
    } catch {
      await storage.removeItem(TOKEN_KEY)
      await storage.removeItem(USER_KEY)
      set({ token: null, user: null, isLoaded: true })
    }
  },
}))
