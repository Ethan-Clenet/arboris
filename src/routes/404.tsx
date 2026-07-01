import { createFileRoute } from '@tanstack/react-router'
import NotFoundPage from '#/components/NotFoundPage'

export const Route = createFileRoute('/404')({
  head: () => ({
    meta: [{ title: '404 — Arboris' }],
  }),
  component: NotFoundPage,
})
