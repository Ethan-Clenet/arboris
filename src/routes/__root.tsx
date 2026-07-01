import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import type { ReactNode } from 'react'
import AppShell from '#/components/AppShell'
import NotFoundPage from '#/components/NotFoundPage'
import ServerErrorPage from '#/components/ServerErrorPage'
import { AnnouncerProvider } from '#/lib/announcer'
import { I18nProvider } from '#/lib/i18n'
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
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Arboris — Catalogue de skills IA' },
      {
        name: 'description',
        content:
          "Catalogue de skills prêts à l'emploi pour ton agent IA. Copie un prompt, ton agent installe la fonctionnalité.",
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css',
      },
      {
        rel: 'stylesheet',
        href: 'https://unpkg.com/@phosphor-icons/web@2.1.1/src/bold/style.css',
      },
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
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <I18nProvider>
          <AnnouncerProvider>
            <AppShell>{children}</AppShell>
          </AnnouncerProvider>
        </I18nProvider>
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'TanStack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
