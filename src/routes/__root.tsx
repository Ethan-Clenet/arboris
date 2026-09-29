import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { lazy, Suspense, type ReactNode } from 'react'
import '#/fonts'
import DeferredFonts from '#/components/DeferredFonts'
import DevtoolsGate from '#/components/DevtoolsGate'
import AppShell from '#/components/AppShell'
import NotFoundPage from '#/components/NotFoundPage'
import ServerErrorPage from '#/components/ServerErrorPage'
import { AnnouncerProvider } from '#/lib/announcer'
import { fontPreloadLinks } from '#/lib/font-preload'
import { I18nProvider } from '#/lib/i18n'
import { rootFallbackMeta } from '#/lib/seo'
import appCss from '#/styles.css?url'

/** Theme anti-FOUC — inline (CSP `unsafe-inline`) pour éviter une requête render-blocking. */
const THEME_INIT = `(function(){try{var t=localStorage.getItem('sp-theme');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();`

const Analytics = lazy(() =>
  import('@vercel/analytics/react').then((m) => ({ default: m.Analytics })),
)
const SpeedInsights = lazy(() =>
  import('@vercel/speed-insights/react').then((m) => ({ default: m.SpeedInsights })),
)

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...rootFallbackMeta(),
    ],
    links: [
      ...fontPreloadLinks,
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'icon', href: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      // Sprite icônes — fetch tôt sans bloquer le rendu.
      { rel: 'preload', href: '/phosphor-sprite.svg', as: 'fetch', crossOrigin: 'anonymous' },
    ],
  }),
  notFoundComponent: NotFoundPage,
  errorComponent: ServerErrorPage,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <HeadContent />
      </head>
      <body>
        <I18nProvider>
          <AnnouncerProvider>
            <AppShell>{children}</AppShell>
          </AnnouncerProvider>
        </I18nProvider>
        <DeferredFonts />
        <DevtoolsGate />
        <Scripts />
        <Suspense fallback={null}>
          <Analytics />
          <SpeedInsights />
        </Suspense>
      </body>
    </html>
  )
}
