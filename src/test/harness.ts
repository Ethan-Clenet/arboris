import { vi } from 'vitest'

export const testRouter = {
  pathname: '/',
  invalidate: vi.fn().mockResolvedValue(undefined),
}

export const serverFns = {
  installSkill: vi.fn(),
  installCommand: vi.fn(),
  getWorkspaceInstallAvailable: vi.fn().mockResolvedValue({ available: false }),
  downloadCollectionZip: vi.fn(),
  downloadCommandZip: vi.fn(),
  downloadSkillZip: vi.fn(),
  getSkillCopyContent: vi.fn(),
}

export function resetTestHarness() {
  testRouter.pathname = '/'
  testRouter.invalidate.mockClear()
  for (const fn of Object.values(serverFns)) {
    fn.mockReset()
  }
  serverFns.getWorkspaceInstallAvailable.mockResolvedValue({ available: false })
}
