import { describe, expect, it } from 'vitest'
import { SITE_URL } from '#/lib/site'
import {
  buildWebInstallCommand,
  parseWebInstallArgs,
  webInstallerFile,
  webInstallerUrl,
} from './web-install-command'

describe('webInstallerUrl / file', () => {
  it('pointe vers les scripts publics du site', () => {
    expect(webInstallerUrl('collection')).toBe(`${SITE_URL}/cli/install-collection.mjs`)
    expect(webInstallerUrl('skill')).toBe(`${SITE_URL}/cli/install-skill.mjs`)
    expect(webInstallerUrl('command')).toBe(`${SITE_URL}/cli/install-command.mjs`)
    expect(webInstallerFile('skill')).toBe('arboris-install-skill.mjs')
  })
})

describe('buildWebInstallCommand', () => {
  it('produit une commande curl|node (Unix) avec --agent', () => {
    const cmd = buildWebInstallCommand({
      kind: 'collection',
      id: 'kotlin-starter',
      os: 'unix',
      extraArgs: '--agent=Claude',
    })
    expect(cmd).toBe(
      `curl -fsSL ${SITE_URL}/cli/install-collection.mjs -o /tmp/arboris-install-collection.mjs && node /tmp/arboris-install-collection.mjs kotlin-starter --agent=Claude`,
    )
    expect(cmd).not.toContain('npx')
  })

  it('produit une commande PowerShell (Windows) pour un id hashé', () => {
    const id = 'huggingface-llm-trainer__huggingface-skills__skills-955045b18625'
    const cmd = buildWebInstallCommand({ kind: 'skill', id, os: 'windows' })
    expect(cmd).toContain('iwr -UseBasicParsing')
    expect(cmd).toContain(`install-skill.mjs`)
    expect(cmd).toContain(`"$env:TEMP\\arboris-install-skill.mjs"`)
    expect(cmd.endsWith(id)).toBe(true)
    expect(cmd).not.toContain('npx')
  })

  it('installe une commande slash via le script dédié', () => {
    const cmd = buildWebInstallCommand({ kind: 'command', id: 'sonar', os: 'unix' })
    expect(cmd).toContain('/cli/install-command.mjs')
    expect(cmd).toContain('sonar')
  })
})

describe('parseWebInstallArgs', () => {
  it('reconnaît collection / skill / command (et l’alias install-command)', () => {
    expect(parseWebInstallArgs('collection ux-ui-pro')).toEqual({
      kind: 'collection',
      id: 'ux-ui-pro',
    })
    expect(parseWebInstallArgs('install gateguard')).toEqual({ kind: 'skill', id: 'gateguard' })
    expect(parseWebInstallArgs('command commit')).toEqual({ kind: 'command', id: 'commit' })
    expect(parseWebInstallArgs('install-command sonar')).toEqual({ kind: 'command', id: 'sonar' })
    expect(parseWebInstallArgs('publisher ECC')).toBeNull()
    expect(parseWebInstallArgs('collection ')).toBeNull()
  })
})
