// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AnnouncerProvider } from '#/lib/announcer'
import { serverFns } from '#/test/harness'
import CliCommandBar from './CliCommandBar'
import SkillInstallButtons from './SkillInstallButtons'
import CommandInstallButtons from './CommandInstallButtons'
import CloudInstallPanel from './CloudInstallPanel'

const skillT = {
  installTitle: 'Installer dans ton projet',
  install: (agent: string) => `Installer pour ${agent}`,
  installed: (path: string) => `Skill écrit dans ${path}`,
  installWarn: 'Score moyen',
  installConfirm: 'Confirmer ?',
  installConfirmYes: 'Installer quand même',
  installConfirmNo: 'Annuler',
  errors: {
    workspace_not_configured: 'Pas de workspace',
    install_unauthorized: 'Jeton invalide',
    unknown_agent: 'Agent inconnu',
    skill_not_found: 'Skill introuvable',
    invalid_path: 'Chemin invalide',
    security_blocked: 'Bloqué',
    generic: 'Erreur générique',
  },
}

const commandT = {
  installTitle: 'Installer commande',
  install: (agent: string) => `Installer pour ${agent}`,
  installed: (path: string) => `Commande écrite dans ${path}`,
  usageHint: 'Tape /nom',
  errors: {
    workspace_not_configured: 'Pas de workspace',
    install_unauthorized: 'Jeton invalide',
    unknown_agent: 'Agent inconnu',
    command_not_found: 'Commande introuvable',
    invalid_path: 'Chemin invalide',
    generic: 'Erreur générique',
  },
}

const cloudT = {
  cloudTitle: 'Installer (cloud)',
  cloudHint: 'ZIP ou CLI',
  downloadZip: (agent: string) => `Télécharger ZIP ${agent}`,
  downloading: 'Préparation…',
  downloaded: (n: number) => `ZIP prêt (${n} fichiers).`,
  copyCli: 'Copier la commande CLI',
  copiedCli: 'Commande copiée !',
  localTitle: 'Install local',
  zipError: 'Impossible de générer le ZIP.',
}

function wrap(ui: ReactNode) {
  return <AnnouncerProvider>{ui}</AnnouncerProvider>
}

const writeText = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  writeText.mockClear()
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })
})

describe('CliCommandBar', () => {
  it('colorie install / publisher / args génériques et copie', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      wrap(<CliCommandBar args="install gateguard" copyLabel="Copier" copiedLabel="Copié" />),
    )
    expect(screen.getByText('gateguard')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Copier' }))
    expect(screen.getByLabelText('Copier')).toBeTruthy()

    rerender(wrap(<CliCommandBar args="publisher ECC" copyLabel="Copier" copiedLabel="Copié" />))
    expect(screen.getByText('ECC')).toBeTruthy()

    rerender(wrap(<CliCommandBar args="node" copyLabel="Copier" copiedLabel="Copié" />))
    expect(screen.getByText('node')).toBeTruthy()
  })
})

describe('SkillInstallButtons', () => {
  it('ne rend rien sans agent supporté', () => {
    const { container } = render(
      <SkillInstallButtons skillId="x" score={90} agents={['Inconnu']} lang="fr" t={skillT} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('installe et affiche le chemin', async () => {
    const user = userEvent.setup()
    serverFns.installSkill.mockResolvedValue({ ok: true, path: '.cursor/skills/gateguard/SKILL.md' })
    render(
      <SkillInstallButtons skillId="gateguard" score={90} agents={['Cursor']} lang="fr" t={skillT} />,
    )
    await user.click(screen.getByRole('button', { name: 'Installer pour Cursor' }))
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toContain('.cursor/skills/gateguard')
    })
  })

  it('avertit à score moyen et demande confirmation si risqué', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <SkillInstallButtons skillId="mid" score={60} agents={['Cursor']} lang="fr" t={skillT} />,
    )
    expect(screen.getByText('Score moyen')).toBeTruthy()

    rerender(
      <SkillInstallButtons skillId="risky" score={10} agents={['Cursor']} lang="fr" t={skillT} />,
    )
    await user.click(screen.getByRole('button', { name: 'Installer pour Cursor' }))
    expect(screen.getByText('Confirmer ?')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(screen.queryByText('Confirmer ?')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Installer pour Cursor' }))
    serverFns.installSkill.mockResolvedValue({ ok: true, path: 'p' })
    await user.click(screen.getByRole('button', { name: 'Installer quand même' }))
    await waitFor(() => expect(serverFns.installSkill).toHaveBeenCalled())
  })

  it('affiche une erreur métier', async () => {
    const user = userEvent.setup()
    serverFns.installSkill.mockResolvedValue({ ok: false, error: 'skill_not_found' })
    render(
      <SkillInstallButtons skillId="x" score={90} agents={['Cursor']} lang="fr" t={skillT} />,
    )
    await user.click(screen.getByRole('button', { name: 'Installer pour Cursor' }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Skill introuvable'))
  })

  it('passe en confirmation si le serveur renvoie security_blocked', async () => {
    const user = userEvent.setup()
    serverFns.installSkill.mockResolvedValue({ ok: false, error: 'security_blocked' })
    render(
      <SkillInstallButtons skillId="x" score={90} agents={['Cursor']} lang="fr" t={skillT} />,
    )
    await user.click(screen.getByRole('button', { name: 'Installer pour Cursor' }))
    await waitFor(() => expect(serverFns.installSkill).toHaveBeenCalled())
    expect(screen.queryByRole('alert')).toBeNull()
  })
})

describe('CommandInstallButtons', () => {
  it('installe ou signale une erreur', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <CommandInstallButtons commandId="commit" agents={[]} lang="fr" t={commandT} />,
    )
    expect(screen.queryByText('Installer commande')).toBeNull()

    serverFns.installCommand.mockResolvedValue({ ok: true, path: '.cursor/commands/commit.md' })
    rerender(
      <CommandInstallButtons commandId="commit" agents={['Cursor']} lang="fr" t={commandT} />,
    )
    await user.click(screen.getByRole('button', { name: 'Installer pour Cursor' }))
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toContain('commit.md')
    })

    serverFns.installCommand.mockResolvedValue({ ok: false, error: 'command_not_found' })
    await user.click(screen.getByRole('button', { name: 'Installer pour Cursor' }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Commande introuvable'))
  })
})

describe('CloudInstallPanel', () => {
  it('télécharge un ZIP et affiche le slot local si disponible', async () => {
    const user = userEvent.setup()
    serverFns.getWorkspaceInstallAvailable.mockResolvedValue({ available: true })
    serverFns.downloadSkillZip.mockResolvedValue({
      ok: true,
      filename: 'a.zip',
      base64: btoa('PK'),
      fileCount: 2,
    })

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(() => 'blob:zip'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    })

    render(
      wrap(
        <CloudInstallPanel
          mode="skill"
          targetId="gateguard"
          lang="fr"
          agents={['Cursor']}
          cliArgs="install gateguard"
          t={cloudT}
          localSlot={<p>local-install</p>}
        />,
      ),
    )

    await waitFor(() => expect(screen.getByText('local-install')).toBeTruthy())
    await user.click(screen.getByRole('button', { name: 'Télécharger ZIP Cursor' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('ZIP prêt'))
  })

  it('affiche une erreur ZIP et couvre collection/command', async () => {
    const user = userEvent.setup()
    serverFns.downloadCollectionZip.mockResolvedValue({ ok: false, error: 'not_found' })
    const { rerender } = render(
      wrap(
        <CloudInstallPanel
          mode="collection"
          targetId="sonar"
          lang="fr"
          agents={['Cursor']}
          cliArgs="collection sonar"
          t={cloudT}
        />,
      ),
    )
    await user.click(screen.getByRole('button', { name: 'Télécharger ZIP Cursor' }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe(cloudT.zipError))

    serverFns.downloadCommandZip.mockResolvedValue({
      ok: true,
      filename: 'c.zip',
      base64: btoa('PK'),
      fileCount: 1,
    })
    rerender(
      wrap(
        <CloudInstallPanel
          mode="command"
          targetId="commit"
          lang="fr"
          agents={['Cursor']}
          cliArgs="install-command commit"
          t={cloudT}
        />,
      ),
    )
    await user.click(screen.getByRole('button', { name: 'Télécharger ZIP Cursor' }))
    await waitFor(() => expect(serverFns.downloadCommandZip).toHaveBeenCalled())
  })
})
