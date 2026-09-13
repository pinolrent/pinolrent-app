import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { THEME_COLORS, type ThemeName } from './theme-colors'

const css = readFileSync('global.css', 'utf8')

const TOKENS: Record<keyof (typeof THEME_COLORS)['light'], string> = {
  background: 'background',
  card: 'card',
  border: 'border',
  text: 'foreground',
  mutedText: 'muted-foreground',
  primary: 'primary',
  primaryForeground: 'primary-foreground',
}

function variantBlock(variant: ThemeName) {
  const start = css.indexOf(`@variant ${variant} {`)
  expect(start, `@variant ${variant} block`).toBeGreaterThan(-1)
  const next = css.indexOf('@variant', start + 1)
  return css.slice(start, next === -1 ? undefined : next)
}

describe('theme colors', () => {
  for (const variant of ['light', 'dark'] as ThemeName[]) {
    it(`mirrors the ${variant} tokens in global.css`, () => {
      const block = variantBlock(variant)
      for (const [key, token] of Object.entries(TOKENS)) {
        const match = block.match(
          new RegExp(`--color-${token}:\\s*([^;]+);`)
        )
        expect(match, `--color-${token} in ${variant}`).not.toBeNull()
        expect(
          THEME_COLORS[variant][key as keyof (typeof THEME_COLORS)['light']]
        ).toBe(match![1].trim().toUpperCase())
      }
    })
  }
})
