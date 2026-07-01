import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

interface AnnouncerValue {
  announce: (message: string) => void
}

const AnnouncerContext = createContext<AnnouncerValue | null>(null)

export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')

  const announce = useCallback((msg: string) => {
    setMessage('')
    requestAnimationFrame(() => setMessage(msg))
  }, [])

  const value = useMemo(() => ({ announce }), [announce])

  return (
    <AnnouncerContext.Provider value={value}>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {message}
      </div>
      {children}
    </AnnouncerContext.Provider>
  )
}

export function useAnnouncer(): AnnouncerValue['announce'] {
  const ctx = useContext(AnnouncerContext)
  if (!ctx) {
    throw new Error('useAnnouncer doit être utilisé dans <AnnouncerProvider>')
  }
  return ctx.announce
}
