// Gestion du thème clair/sombre d'Arboris.
// Le thème vit sur <html data-theme="…"> ; les variables CSS en découlent.
// La bascule utilise l'API View Transitions (révélation en clip-path circulaire)
// avec repli instantané si l'API ou le mouvement réduit l'empêchent.
import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const KEY = 'sp-theme'
const EVENT = 'arboris-theme-change'

export function getTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  try {
    const stored = window.localStorage.getItem(KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* ignore */
  }
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'light' ? 'light' : 'dark'
}

function apply(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.style.colorScheme = theme
}

function persist(theme: Theme) {
  try {
    window.localStorage.setItem(KEY, theme)
  } catch {
    /* ignore */
  }
}

function emit(theme: Theme) {
  try {
    window.dispatchEvent(new CustomEvent<Theme>(EVENT, { detail: theme }))
  } catch {
    /* ignore */
  }
}

function swap(theme: Theme) {
  apply(theme)
  persist(theme)
  emit(theme)
}

export function toggleTheme(button?: HTMLElement | null, duration = 480) {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark'
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => {
      ready: Promise<void>
      finished: Promise<void>
    }
  }

  if (typeof doc.startViewTransition !== 'function' || reduce) {
    swap(next)
    return
  }

  const vw = window.visualViewport?.width ?? window.innerWidth
  const vh = window.visualViewport?.height ?? window.innerHeight
  let x = vw / 2
  let y = vh / 2
  if (button?.getBoundingClientRect) {
    const r = button.getBoundingClientRect()
    x = r.left + r.width / 2
    y = r.top + r.height / 2
  }
  const maxR = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y))
  const from = `circle(0px at ${x}px ${y}px)`
  const to = `circle(${maxR}px at ${x}px ${y}px)`

  const root = document.documentElement
  root.setAttribute('data-arboris-vt', 'active')
  root.style.setProperty('--arboris-vt-duration', `${duration}ms`)

  const cleanup = () => {
    root.removeAttribute('data-arboris-vt')
    root.style.removeProperty('--arboris-vt-duration')
  }

  const vt = doc.startViewTransition(() => swap(next))
  vt.finished.finally(cleanup)
  vt.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [from, to] },
      {
        duration,
        easing: 'ease-in-out',
        fill: 'forwards',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  })
}

/** Hook React : renvoie le thème courant et se met à jour sur changement. */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    setTheme(getTheme())
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<Theme>).detail
      if (detail === 'light' || detail === 'dark') setTheme(detail)
    }
    window.addEventListener(EVENT, onChange)
    return () => window.removeEventListener(EVENT, onChange)
  }, [])

  return theme
}
