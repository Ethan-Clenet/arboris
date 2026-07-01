import { useCallback, useEffect, useRef, useState } from 'react'
import { useAnnouncer } from '#/lib/announcer'

/**
 * Copie dans le presse-papiers avec un état « copié » transitoire, identifié
 * par une clé (l'id du skill, ou '__all' pour un lot).
 */
export function useCopy(resetMs = 1600) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const announce = useAnnouncer()

  const copy = useCallback(
    (text: string, key: string, announceMsg?: string) => {
      try {
        void navigator.clipboard?.writeText(text)
      } catch {
        /* presse-papiers indisponible */
      }
      setCopiedKey(key)
      if (announceMsg) announce(announceMsg)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopiedKey(null), resetMs)
    },
    [resetMs, announce],
  )

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  return { copiedKey, copy }
}
