import { useBreakpoints } from '@/hooks/useBreakpoints'

// La composición de las pantallas de detalle: una columna principal con el
// artefacto y una lateral con la decisión. Antes de 720px de contenido se
// apila, y la decisión va abajo.
export function useDetailSplit() {
  const { isWide } = useBreakpoints()
  return {
    isWide,
    container: isWide ? 'flex-row items-start gap-6' : 'gap-4',
    main: 'flex-1',
    side: isWide ? 'w-80 gap-3' : 'gap-3',
  }
}
