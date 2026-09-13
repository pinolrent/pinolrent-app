import { useState } from 'react'

export function useHover() {
  const [hovered, setHovered] = useState(false)
  return {
    hovered,
    hoverProps: {
      onHoverIn: () => setHovered(true),
      onHoverOut: () => setHovered(false),
    },
  }
}
