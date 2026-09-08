import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  assertInstallToken,
  isWorkspaceInstallConfigured,
} from './install-auth.server'

const rootKey = 'ARBORIS_WORKSPACE_ROOT'
const tokenKey = 'ARBORIS_INSTALL_TOKEN'

beforeEach(() => {
  delete process.env[rootKey]
  delete process.env[tokenKey]
})

afterEach(() => {
  delete process.env[rootKey]
  delete process.env[tokenKey]
})

describe('isWorkspaceInstallConfigured', () => {
  it('exige root et token', () => {
    expect(isWorkspaceInstallConfigured()).toBe(false)
    process.env[rootKey] = '/tmp/ws'
    expect(isWorkspaceInstallConfigured()).toBe(false)
    process.env[tokenKey] = 'secret-token-value-32chars-min!!'
    expect(isWorkspaceInstallConfigured()).toBe(true)
  })
})

describe('assertInstallToken', () => {
  it('refuse si le secret serveur est absent', () => {
    expect(() => assertInstallToken('anything')).toThrow('install_unauthorized')
  })

  it('refuse un jeton manquant ou incorrect', () => {
    process.env[tokenKey] = 'correct-secret'
    expect(() => assertInstallToken(undefined)).toThrow('install_unauthorized')
    expect(() => assertInstallToken('wrong')).toThrow('install_unauthorized')
  })

  it('accepte le jeton exact', () => {
    process.env[tokenKey] = 'correct-secret'
    expect(() => assertInstallToken('correct-secret')).not.toThrow()
  })
})
