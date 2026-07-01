import { createFileRoute } from '@tanstack/react-router'
import ServerErrorPage from '#/components/ServerErrorPage'

export const Route = createFileRoute('/500')({
  head: () => ({
    meta: [{ title: '500 — Arboris' }],
  }),
  component: Error500DemoPage,
})

/** Page statique pour prévisualiser l’UI d’erreur serveur. */
function Error500DemoPage() {
  return <ServerErrorPage error={new Error('Demo error')} reset={() => {}} />
}
