import { afterEach, describe, expect, it } from 'vitest'
import {
  assertRateLimit,
  resetRateLimitBuckets,
} from './rate-limit.server'

afterEach(() => {
  resetRateLimitBuckets()
})

describe('assertRateLimit', () => {
  it('autorise sous la limite puis refuse', () => {
    assertRateLimit('t', { limit: 2, windowMs: 60_000 })
    assertRateLimit('t', { limit: 2, windowMs: 60_000 })
    expect(() => assertRateLimit('t', { limit: 2, windowMs: 60_000 })).toThrow('rate_limited')
  })

  it('isole les clés', () => {
    assertRateLimit('a', { limit: 1, windowMs: 60_000 })
    expect(() => assertRateLimit('a', { limit: 1, windowMs: 60_000 })).toThrow('rate_limited')
    expect(() => assertRateLimit('b', { limit: 1, windowMs: 60_000 })).not.toThrow()
  })
})
