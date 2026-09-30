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
import { beforeSendMeasurement } from '#/lib/analytics-optout'
import { rootFallbackMeta, notFoundSeo } from '#/lib/seo'
import appCss from '#/styles.css?url'

const Analytics = lazy(() =>
  import('@vercel/analytics/react').then((m) => ({ default: m.Analytics })),
)
const SpeedInsights = lazy(() =>
  import('@vercel/speed-insights/react').then((m) => ({ default: m.SpeedInsights })),
)

export const Route = createRootRoute({
  head: ({ matches }) => {
    const isNotFound = matches.some((match) => match.status === 'notFound')
    const seo = isNotFound ? notFoundSeo() : { meta: rootFallbackMeta(), links: [] as Array<{ rel: string; href: string }> }
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#197544' },
        ...seo.meta,
      ],
      links: [
        ...fontPreloadLinks,
        { rel: 'stylesheet', href: appCss },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'preload', href: '/phosphor-sprite.svg', as: 'fetch', crossOrigin: 'anonymous' },
        ...(seo.links ?? []),
      ],
    }
  },
  notFoundComponent: NotFoundPage,
  errorComponent: ServerErrorPage,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <head>
        <script src="/arboris-theme-init.js" />
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
          <Analytics beforeSend={beforeSendMeasurement} />
          <SpeedInsights beforeSend={beforeSendMeasurement} />
        </Suspense>
      </body>
    </html>
  )
}
