import type { TextStyle } from 'react-native'

// Números tabulares: precios, totales y métricas se alinean entre filas y no
// bailan cuando el valor cambia.
export const NUMERIC: TextStyle = { fontVariant: ['tabular-nums'] }

// Rótulos cortos en mayúsculas: un punto de tracking los separa del cuerpo.
export const SECTION_LABEL: TextStyle = { letterSpacing: 0.6 }

// No se fija line-height: en React Native es un valor absoluto que no acompaña
// el escalado de texto del sistema, así que con el texto al doble las líneas
// se pisarían. El leading unitario de la plataforma es el correcto.
