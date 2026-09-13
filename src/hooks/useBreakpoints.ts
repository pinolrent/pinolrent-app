import { useWindowDimensions } from 'react-native'

export const BREAKPOINTS = {
  tablet: 600,
  desktop: 900,
} as const

export function useBreakpoints() {
  const { width } = useWindowDimensions()
  const isPhone = width < BREAKPOINTS.tablet
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop
  const isDesktop = width >= BREAKPOINTS.desktop
  const columns = width >= BREAKPOINTS.desktop ? 3 : width >= BREAKPOINTS.tablet ? 2 : 1
  return { width, isPhone, isTablet, isDesktop, columns }
}
