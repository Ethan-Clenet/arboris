import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('joint les classes truthy et ignore les valeurs falsy', () => {
    expect(cn('a', false, 'b', null, undefined, 'c')).toBe('a b c')
  })

  it('renvoie une chaîne vide sans arguments', () => {
    expect(cn()).toBe('')
  })
})
