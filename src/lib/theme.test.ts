import { describe, expect, it } from 'vitest'
import { getTheme } from './theme'

describe('getTheme', () => {
  it('retourne dark sans document (SSR / Node)', () => {
    expect(getTheme()).toBe('dark')
  })
})
