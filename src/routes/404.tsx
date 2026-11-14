import { createFileRoute } from '@tanstack/react-router'
import NotFoundPage from '#/components/NotFoundPage'
import { privateNoStoreHeaders } from '#/lib/http-cache'
import { notFoundSeo } from '#/lib/seo'

export const Route = createFileRoute('/404')({
  headers: privateNoStoreHeaders,
  head: () => notFoundSeo(),
  component: NotFoundPage,
})
