// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getTheme, toggleTheme, useTheme } from './theme'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('data-arboris-vt')
})

describe('getTheme (jsdom)', () => {
  it('lit localStorage puis data-theme', () => {
    window.localStorage.setItem('sp-theme', 'light')
    expect(getTheme()).toBe('light')
    window.localStorage.removeItem('sp-theme')
    document.documentElement.setAttribute('data-theme', 'light')
    expect(getTheme()).toBe('light')
    document.documentElement.removeAttribute('data-theme')
    expect(getTheme()).toBe('dark')
  })
})

describe('toggleTheme', () => {
  it('bascule sans View Transition', () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    window.localStorage.setItem('sp-theme', 'dark')
    toggleTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(window.localStorage.getItem('sp-theme')).toBe('light')
  })

  it('anime via startViewTransition si disponible', async () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    const animate = vi.fn()
    Object.assign(document.documentElement, { animate })

    const finished = Promise.resolve()
    const ready = Promise.resolve()
    const startViewTransition = vi.fn((cb: () => void) => {
      cb()
      return { ready, finished }
    })
    Object.assign(document, { startViewTransition })

    const btn = document.createElement('button')
    vi.spyOn(btn, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      top: 10,
      width: 20,
      height: 20,
      right: 30,
      bottom: 30,
      x: 10,
      y: 10,
      toJSON: () => ({}),
    })

    toggleTheme(btn, 120)
    expect(startViewTransition).toHaveBeenCalled()
    await waitFor(() => expect(animate).toHaveBeenCalled())
    await finished
    expect(document.documentElement.hasAttribute('data-arboris-vt')).toBe(false)
  })
})

describe('useTheme', () => {
  it('suit l’événement arboris-theme-change', () => {
    window.localStorage.setItem('sp-theme', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current).toBe('dark')
    act(() => {
      window.dispatchEvent(new CustomEvent('arboris-theme-change', { detail: 'light' }))
    })
    expect(result.current).toBe('light')
  })
})

describe('toggleTheme reduced-motion', () => {
  it('skip l’animation si prefers-reduced-motion', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as never
    Object.assign(document, { startViewTransition: vi.fn() })
    document.documentElement.setAttribute('data-theme', 'dark')
    toggleTheme()
    expect((document as Document & { startViewTransition?: unknown }).startViewTransition).not.toHaveBeenCalled()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })
})
