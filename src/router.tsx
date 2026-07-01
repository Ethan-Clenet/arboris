import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import NotFoundPage from '#/components/NotFoundPage'
import ServerErrorPage from '#/components/ServerErrorPage'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFoundPage,
    defaultErrorComponent: ServerErrorPage,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
