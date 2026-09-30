// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest'
import {
  VA_DISABLE_KEY,
  beforeSendMeasurement,
  isMeasurementDisabled,
  setMeasurementDisabled,
} from './analytics-optout'

describe('analytics-optout', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('est inactif par défaut', () => {
    expect(isMeasurementDisabled()).toBe(false)
    expect(beforeSendMeasurement({ type: 'pageview', url: '/' })).toEqual({
      type: 'pageview',
      url: '/',
    })
  })

  it('pose va-disable et drop les événements', () => {
    setMeasurementDisabled(true)
    expect(localStorage.getItem(VA_DISABLE_KEY)).toBe('1')
    expect(isMeasurementDisabled()).toBe(true)
    expect(beforeSendMeasurement({ type: 'pageview', url: '/' })).toBeNull()
    setMeasurementDisabled(false)
    expect(localStorage.getItem(VA_DISABLE_KEY)).toBeNull()
    expect(beforeSendMeasurement({ type: 'vital', url: '/' })).toEqual({ type: 'vital', url: '/' })
  })
})
