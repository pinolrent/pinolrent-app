import type { TextStyle } from 'react-native'

// La voz de la app es Barlow Semi Condensed, la grotesca de la señalización
// vial: títulos y precios se leen como un cartel de alquiler, no como el texto
// de un tablero. El texto corrido se queda en la sans del sistema, que es la
// que cada plataforma ya tiene ajustada para leer.
export const DISPLAY: TextStyle = {
  fontFamily: 'BarlowSemiCondensed_600SemiBold',
}

// Números tabulares: precios, totales y métricas se alinean entre filas y no
// bailan cuando el valor cambia.
export const NUMERIC: TextStyle = {
  fontFamily: 'BarlowSemiCondensed_500Medium',
  fontVariant: ['tabular-nums'],
}

// Rótulo de sección: semibold y apagado, sin mayúsculas ni tracking — la
// jerarquía la da el peso, no un recurso tipográfico.
export const SECTION_LABEL: TextStyle = {
  fontFamily: 'BarlowSemiCondensed_600SemiBold',
}

// No se fija line-height: en React Native es un valor absoluto que no acompaña
// el escalado de texto del sistema, así que con el texto al doble las líneas
// se pisarían. El leading unitario de la plataforma es el correcto.
