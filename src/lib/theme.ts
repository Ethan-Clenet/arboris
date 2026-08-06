// Gestion du thème clair/sombre d'Arboris.
// Le thème vit sur <html data-theme="…"> ; les variables CSS en découlent.
// Bascule instantanée (pas de View Transition) : le catalogue skills a un DOM
// trop lourd pour snapshotter toute la page sans lag.
import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const KEY = 'sp-theme'
const EVENT = 'arboris-theme-change'

// Script exécuté avant le premier paint (injecté dans <head>) pour éviter tout
// flash de thème incorrect au chargement.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${KEY}');if(t!=='light'&&t!=='dark'){t='dark';}document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`

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

/** Bascule clair ↔ sombre (instantané — évite le lag View Transition sur pages lourdes). */
export function toggleTheme(_button?: HTMLElement | null) {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark'
  swap(next)
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
