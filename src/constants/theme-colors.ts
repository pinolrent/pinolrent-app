export const THEME_COLORS = {
  light: {
    background: '#FFFFFF',
    card: '#FFFFFF',
    border: '#DCE2E9',
    text: '#13191F',
    mutedText: '#616A74',
    primary: '#004D91',
    primaryForeground: '#FFFFFF',
  },
  dark: {
    background: '#0A121B',
    card: '#151F2A',
    border: '#2B394A',
    text: '#E4E8ED',
    mutedText: '#9CA6B1',
    primary: '#6F9CCF',
    primaryForeground: '#0A121B',
  },
} as const

export type ThemeName = keyof typeof THEME_COLORS
export type ThemePalette = (typeof THEME_COLORS)[ThemeName]
