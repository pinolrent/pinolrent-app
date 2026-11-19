import { FadeIn } from 'react-native-reanimated'

// Presupuesto de movimiento de la app. 150ms es la base de respuesta: más
// rápido se siente nervioso, más lento se siente pesado.
export const MOTION = {
  // Aparición de contenido y notas de estado.
  reveal: 200,
  // Salida de un sheet, alrededor del 70% de su entrada.
  exit: 180,
  // Pulso de los skeletons mientras se espera.
  pulse: 800,
} as const

// La versión reducida no mueve nada: el contenido aparece ya en su lugar.
export function enterFade(reduce: boolean) {
  return reduce ? undefined : FadeIn.duration(MOTION.reveal)
}

// El contenido de una lista aparece con la lista, no tarjeta por tarjeta: el
// movimiento queda para los cambios de estado que el usuario provoca.
