import axios from 'axios'
import { create } from 'zustand'
import api from '@/services/api'
import { storage } from '@/utils/storage'
import type { User } from '@/types/auth'

const TOKEN_KEY = 'pinolrent_token'
const REFRESH_KEY = 'pinolrent_refresh_token'
const USER_KEY = 'pinolrent_user'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  isLoaded: boolean
  setAuth: (token: string, refreshToken: string, user: User) => Promise<void>
  setUser: (user: User) => Promise<void>
  updateTokens: (token: string, refreshToken: string) => Promise<void>
  clearAuth: () => Promise<void>
  loadFromStorage: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  user: null,
  isLoaded: false,

  setAuth: async (token, refreshToken, user) => {
    await storage.setItem(TOKEN_KEY, token)
    await storage.setItem(REFRESH_KEY, refreshToken)
    await storage.setItem(USER_KEY, JSON.stringify(user))
    set({ token, refreshToken, user })
  },

  setUser: async (user) => {
    await storage.setItem(USER_KEY, JSON.stringify(user))
    set({ user })
  },

  updateTokens: async (token, refreshToken) => {
    await storage.setItem(TOKEN_KEY, token)
    await storage.setItem(REFRESH_KEY, refreshToken)
    set({ token, refreshToken })
  },

  clearAuth: async () => {
    await storage.removeItem(TOKEN_KEY)
    await storage.removeItem(REFRESH_KEY)
    await storage.removeItem(USER_KEY)
    set({ token: null, refreshToken: null, user: null })
  },

  loadFromStorage: async () => {
    const token = await storage.getItem(TOKEN_KEY)
    const refreshToken = await storage.getItem(REFRESH_KEY)
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
      set({ token, refreshToken, user, isLoaded: true })
    } catch (err) {
      if (axios.isAxiosError(err) && !err.response) {
        set({ token, refreshToken, user: null, isLoaded: true })
        return
      }
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401 &&
        refreshToken
      ) {
        try {
          const pair = await api
            .post<{ token: string; refresh_token: string }>('/auth/refresh', {
              refresh_token: refreshToken,
            })
            .then((r) => r.data)
          await storage.setItem(TOKEN_KEY, pair.token)
          await storage.setItem(REFRESH_KEY, pair.refresh_token)
          const user = await api
            .get<User>('/auth/me', {
              headers: { Authorization: `Bearer ${pair.token}` },
            })
            .then((r) => r.data)
          set({
            token: pair.token,
            refreshToken: pair.refresh_token,
            user,
            isLoaded: true,
          })
          return
        } catch {
          // refresh failed: fall through to wipe
        }
      }
      await storage.removeItem(TOKEN_KEY)
      await storage.removeItem(REFRESH_KEY)
      await storage.removeItem(USER_KEY)
      set({ token: null, refreshToken: null, user: null, isLoaded: true })
    }
  },
}))
