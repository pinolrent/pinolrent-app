import { create } from 'zustand'
import { Uniwind } from 'uniwind'
import { storage } from '@/utils/storage'

const THEME_KEY = 'pinolrent_theme'

export type ThemeMode = 'light' | 'dark'

interface ThemeState {
  theme: ThemeMode
  isLoaded: boolean
  setTheme: (theme: ThemeMode) => Promise<void>
  toggle: () => Promise<void>
  loadTheme: () => Promise<void>
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  isLoaded: false,

  setTheme: async (theme) => {
    await storage.setItem(THEME_KEY, theme)
    Uniwind.setTheme(theme)
    set({ theme })
  },

  toggle: async () => {
    await get().setTheme(get().theme === 'light' ? 'dark' : 'light')
  },

  loadTheme: async () => {
    const saved = await storage.getItem(THEME_KEY)
    const theme: ThemeMode = saved === 'dark' ? 'dark' : 'light'
    Uniwind.setTheme(theme)
    set({ theme, isLoaded: true })
  },
}))
