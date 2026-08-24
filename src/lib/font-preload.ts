/** URLs de preload pour les polices critiques (LCP / titres font-display). */
import spaceGrotesk600 from '@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff2?url'
import spaceGrotesk700 from '@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2?url'

export const fontPreloadLinks = [
  {
    rel: 'preload' as const,
    href: spaceGrotesk600,
    as: 'font' as const,
    type: 'font/woff2',
    crossOrigin: 'anonymous' as const,
  },
  {
    rel: 'preload' as const,
    href: spaceGrotesk700,
    as: 'font' as const,
    type: 'font/woff2',
    crossOrigin: 'anonymous' as const,
  },
]
