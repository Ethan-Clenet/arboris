/** URLs de preload pour la police LCP (Space Grotesk / font-display). */
import spaceGrotesk600 from '@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff2?url'

export const fontPreloadLinks = [
  {
    rel: 'preload' as const,
    href: spaceGrotesk600,
    as: 'font' as const,
    type: 'font/woff2',
    crossOrigin: 'anonymous' as const,
  },
]
