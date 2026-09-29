import { describe, expect, it, vi } from 'vitest'
import {
  isDbUnreachable,
  isProductionEnv,
  runVercelBuild,
  shouldSyncCatalog,
  VercelBuildError,
} from './vercel-build.mjs'

function mockExec(handlers = {}) {
  return vi.fn((command, options = {}) => {
    for (const [prefix, result] of Object.entries(handlers)) {
      if (command.startsWith(prefix)) {
        if (result instanceof Error) throw result
        if (typeof result === 'function') return result(command, options)
        return result
      }
    }
    throw new Error(`unexpected command: ${command}`)
  })
}

describe('isProductionEnv', () => {
  it('n’est vrai que pour VERCEL_ENV=production', () => {
    expect(isProductionEnv({ VERCEL_ENV: 'production' })).toBe(true)
    expect(isProductionEnv({ VERCEL_ENV: 'preview' })).toBe(false)
    expect(isProductionEnv({})).toBe(false)
  })
})

describe('shouldSyncCatalog', () => {
  it('sync en production ou si SYNC_CATALOG=1', () => {
    expect(shouldSyncCatalog({ VERCEL_ENV: 'production' })).toBe(true)
    expect(shouldSyncCatalog({ VERCEL_ENV: 'preview' })).toBe(false)
    expect(shouldSyncCatalog({ VERCEL_ENV: 'preview', SYNC_CATALOG: '1' })).toBe(true)
  })
})

describe('isDbUnreachable', () => {
  it('détecte P1001 / quota / réseau', () => {
    expect(isDbUnreachable("Can't reach database server")).toBe(true)
    expect(isDbUnreachable('P1001: timeout')).toBe(true)
    expect(isDbUnreachable('Database schema is up to date')).toBe(false)
  })
})

describe('runVercelBuild', () => {
  it('échoue en production sans DATABASE_URL', () => {
    const exec = mockExec()
    expect(() =>
      runVercelBuild({ env: { VERCEL_ENV: 'production' }, exec }),
    ).toThrow(VercelBuildError)
    expect(exec).not.toHaveBeenCalled()
  })

  it('continue en preview sans DATABASE_URL', () => {
    const exec = mockExec({ 'npm run build': '' })
    runVercelBuild({ env: { VERCEL_ENV: 'preview' }, exec })
    expect(exec).toHaveBeenCalledWith('npm run build', expect.objectContaining({ stdio: 'inherit' }))
  })

  it('échoue en production si la base est injoignable', () => {
    const unreachable = new Error("Can't reach database server")
    unreachable.stderr = 'P1001'
    const exec = mockExec({ 'npx prisma migrate status': unreachable })
    expect(() =>
      runVercelBuild({
        env: { VERCEL_ENV: 'production', DATABASE_URL: 'postgres://x' },
        exec,
      }),
    ).toThrow(/Build production stoppé/)
    expect(exec.mock.calls.some(([cmd]) => cmd === 'npm run build')).toBe(false)
  })

  it('continue en preview si la base est injoignable', () => {
    const unreachable = new Error("Can't reach database server")
    unreachable.stderr = 'P1001'
    const exec = mockExec({
      'npx prisma migrate status': unreachable,
      'npm run build': '',
    })
    runVercelBuild({
      env: { VERCEL_ENV: 'preview', DATABASE_URL: 'postgres://x' },
      exec,
    })
    expect(exec.mock.calls.some(([cmd]) => cmd === 'npm run build')).toBe(true)
  })

  it('échoue en production si migrate deploy échoue', () => {
    const exec = mockExec({
      'npx prisma migrate status': 'The following migrations have not yet been applied:\n  20240101',
      'npx prisma migrate deploy': Object.assign(new Error('migrate failed'), { stderr: 'boom' }),
    })
    expect(() =>
      runVercelBuild({
        env: { VERCEL_ENV: 'production', DATABASE_URL: 'postgres://x' },
        exec,
      }),
    ).toThrow(/Échec des migrations en production/)
  })

  it('ne fait pas échouer le build si le sync catalogue casse', () => {
    const exec = mockExec({
      'npx prisma migrate status': 'Database schema is up to date',
      'npx tsx scripts/sync-catalog.ts': new Error('quota'),
      'npm run build': '',
    })
    runVercelBuild({
      env: { VERCEL_ENV: 'production', DATABASE_URL: 'postgres://x' },
      exec,
    })
    expect(exec.mock.calls.some(([cmd]) => cmd === 'npm run build')).toBe(true)
  })
})
