import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { resetTestHarness } from './harness'

vi.mock('@tanstack/react-router', async () => {
  const { createElement } = await import('react')
  const { testRouter } = await import('./harness')
  return {
    Link: ({
      to,
      children,
      className,
      title,
      onClick,
    }: {
      to?: string
      children?: unknown
      className?: string
      title?: string
      onClick?: (event: unknown) => void
    }) =>
      createElement(
        'a',
        { href: typeof to === 'string' ? to : '/', className, title, onClick },
        children as never,
      ),
    useRouter: () => ({ invalidate: testRouter.invalidate }),
    useRouterState: ({
      select,
    }: {
      select: (s: { location: { pathname: string } }) => unknown
    }) => select({ location: { pathname: testRouter.pathname } }),
    redirect: vi.fn(),
    createFileRoute: () => (opts: Record<string, unknown>) => opts,
    notFound: vi.fn(),
  }
})

vi.mock('@tanstack/react-start', async () => {
  const { vi: v } = await import('vitest')
  return {
    useServerFn: (fn: unknown) => (typeof fn === 'function' ? fn : v.fn()),
    createServerFn: () => {
      const api = {
        validator: () => api,
        handler: (h: unknown) => h,
      }
      return api
    },
  }
})

vi.mock('#/server/functions', async () => {
  const { serverFns } = await import('./harness')
  return {
    installSkill: (...args: unknown[]) => serverFns.installSkill(...args),
    installCommand: (...args: unknown[]) => serverFns.installCommand(...args),
    getWorkspaceInstallAvailable: (...args: unknown[]) =>
      serverFns.getWorkspaceInstallAvailable(...args),
    downloadCollectionZip: (...args: unknown[]) => serverFns.downloadCollectionZip(...args),
    downloadCommandZip: (...args: unknown[]) => serverFns.downloadCommandZip(...args),
    downloadSkillZip: (...args: unknown[]) => serverFns.downloadSkillZip(...args),
    getSkillCopyContent: (...args: unknown[]) => serverFns.getSkillCopyContent(...args),
  }
})

if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

afterEach(() => {
  cleanup()
  resetTestHarness()
  if (typeof window !== 'undefined') {
    window.localStorage.clear()
  }
})
