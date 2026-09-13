export const THEME_COLORS = {
  light: {
    background: '#FFFFFF',
    card: '#FFFFFF',
    border: '#E2E8F0',
    text: '#0F172A',
    mutedText: '#5F6C80',
    primary: '#1D4ED8',
    primaryForeground: '#FFFFFF',
  },
  dark: {
    background: '#0B1220',
    card: '#111C33',
    border: '#243352',
    text: '#E2E8F0',
    mutedText: '#94A3B8',
    primary: '#60A5FA',
    primaryForeground: '#0B1220',
  },
} as const

export type ThemeName = keyof typeof THEME_COLORS
export type ThemePalette = (typeof THEME_COLORS)[ThemeName]
