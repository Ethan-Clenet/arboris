// Server functions TanStack Start.
// Le corps des `.handler(...)` est retiré du bundle client par le compilateur ;
// l'import dynamique de `./catalog.server` (qui charge Prisma) reste donc
// strictement côté serveur.
import { createServerFn } from '@tanstack/react-start'
import type { Catalog, SkillDetail } from '#/lib/catalog'

export const getCatalog = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Catalog> => {
    const { loadCatalog } = await import('./catalog.server')
    return loadCatalog()
  },
)

export const getSkill = createServerFn({ method: 'GET' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<SkillDetail | null> => {
    const { loadSkill } = await import('./catalog.server')
    return loadSkill(data.id)
  })
