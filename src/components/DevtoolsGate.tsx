import { lazy, Suspense } from 'react'

const DevtoolsPanel = import.meta.env.DEV
  ? lazy(() => import('#/components/DevtoolsPanel'))
  : null

/** Devtools TanStack — absent du bundle production. */
export default function DevtoolsGate() {
  if (!DevtoolsPanel) return null
  return (
    <Suspense fallback={null}>
      <DevtoolsPanel />
    </Suspense>
  )
}
