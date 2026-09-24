import { useWindowDimensions } from 'react-native'

export const BREAKPOINTS = {
  tablet: 600,
  desktop: 900,
  split: 720,
  table: 760,
} as const

// El sidebar de escritorio ocupa 240px (w-60) del ancho de la ventana.
export const SIDEBAR_WIDTH = 240

export function useBreakpoints() {
  const { width } = useWindowDimensions()
  const isPhone = width < BREAKPOINTS.tablet
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop
  const isDesktop = width >= BREAKPOINTS.desktop
  // A partir de acá las decisiones de composición se toman contra el ancho
  // disponible real: con el sidebar, una ventana de 900px deja 660 de contenido.
  const contentWidth = isDesktop ? width - SIDEBAR_WIDTH : width
  const isWide = contentWidth >= BREAKPOINTS.split
  const columns = contentWidth >= 960 ? 3 : contentWidth >= 640 ? 2 : 1
  return { width, contentWidth, isPhone, isTablet, isDesktop, isWide, columns }
}
