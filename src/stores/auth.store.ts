import axios from 'axios'
import { create } from 'zustand'
import api from '@/services/api'
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
    const token = await storage.getItem(TOKEN_KEY)
    if (!token) {
      set({ isLoaded: true })
      return
    }
    try {
      const user = await api
        .get<User>('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((r) => r.data)
      set({ token, user, isLoaded: true })
    } catch (err) {
      if (axios.isAxiosError(err) && !err.response) {
        set({ token, user: null, isLoaded: true })
        return
      }
      await storage.removeItem(TOKEN_KEY)
      await storage.removeItem(USER_KEY)
      set({ token: null, user: null, isLoaded: true })
    }
  },
}))
