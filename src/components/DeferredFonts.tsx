import { useEffect } from 'react'

/** Importe Hanken + JetBrains après hydratation pour ne pas bloquer FCP/LCP. */
export default function DeferredFonts() {
  useEffect(() => {
    void import('#/fonts-deferred')
  }, [])
  return null
}
