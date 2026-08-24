import { vi } from 'vitest'

export const testRouter = {
  pathname: '/',
  invalidate: vi.fn().mockResolvedValue(undefined),
  authUser: null as null | {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'USER'
  },
}

export const serverFns = {
  installSkill: vi.fn(),
  installCommand: vi.fn(),
  getWorkspaceInstallAvailable: vi.fn().mockResolvedValue({ available: false }),
  downloadCollectionZip: vi.fn(),
  downloadCommandZip: vi.fn(),
  downloadSkillZip: vi.fn(),
  getSkillCopyContent: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
}

export function resetTestHarness() {
  testRouter.pathname = '/'
  testRouter.authUser = null
  testRouter.invalidate.mockClear()
  for (const fn of Object.values(serverFns)) {
    fn.mockReset()
  }
  serverFns.getWorkspaceInstallAvailable.mockResolvedValue({ available: false })
  serverFns.logout.mockResolvedValue(undefined)
}
