import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import '#/fonts'
import DevtoolsGate from '#/components/DevtoolsGate'
import AppShell from '#/components/AppShell'
import NotFoundPage from '#/components/NotFoundPage'
import ServerErrorPage from '#/components/ServerErrorPage'
import { AnnouncerProvider } from '#/lib/announcer'
import { fontPreloadLinks } from '#/lib/font-preload'
import { I18nProvider } from '#/lib/i18n'
import { rootFallbackMeta } from '#/lib/seo'
import { getCurrentUser } from '#/server/auth.functions'
import appCss from '#/styles.css?url'

export const Route = createRootRoute({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    return { auth: { user } }
  },
  head: () => ({
    meta: [
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...rootFallbackMeta(),
    ],
    links: [
      ...fontPreloadLinks,
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
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
        {/*
          Script externe (CSP). Les payloads d’hydratation TanStack Start restent
          inline : script-src prod doit inclure 'unsafe-inline' (vercel.json).
        */}
        <script src="/arboris-theme-init.js"></script>
        <HeadContent />
      </head>
      <body>
        <I18nProvider>
          <AnnouncerProvider>
            <AppShell>{children}</AppShell>
          </AnnouncerProvider>
        </I18nProvider>
        <DevtoolsGate />
        <Scripts />
      </body>
    </html>
  )
}
