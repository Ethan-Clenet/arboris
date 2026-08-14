import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import type { ReactNode } from 'react'
import '@phosphor-icons/web/regular'
import '@phosphor-icons/web/bold'
import AppShell from '#/components/AppShell'
import NotFoundPage from '#/components/NotFoundPage'
import ServerErrorPage from '#/components/ServerErrorPage'
import { AnnouncerProvider } from '#/lib/announcer'
import { I18nProvider } from '#/lib/i18n'
import { rootFallbackMeta } from '#/lib/seo'
import { getCurrentUser } from '#/server/auth.functions'
import { THEME_INIT_SCRIPT } from '#/lib/theme'
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
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <I18nProvider>
          <AnnouncerProvider>
            <AppShell>{children}</AppShell>
          </AnnouncerProvider>
        </I18nProvider>
        {import.meta.env.DEV ? (
          <TanStackDevtools
            config={{ position: 'bottom-right' }}
            plugins={[
              {
                name: 'TanStack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        ) : null}
        <Scripts />
      </body>
    </html>
  )
}
