import { describe, expect, it } from 'vitest'
import { agentCommandPath, agentDot, agentSkillPath, isAgentName } from './agents'

describe('isAgentName', () => {
  it('accepte les 4 agents connus', () => {
    expect(isAgentName('Cursor')).toBe(true)
    expect(isAgentName('Claude')).toBe(true)
    expect(isAgentName('Codex')).toBe(true)
    expect(isAgentName('Copilot')).toBe(true)
  })

  it('refuse un nom inconnu', () => {
    expect(isAgentName('Windsurf')).toBe(false)
    expect(isAgentName('cursor')).toBe(false)
  })
})

describe('chemins agents', () => {
  it('place SKILL.md dans le dossier de l’agent', () => {
    expect(agentSkillPath('Cursor', 'gateguard')).toBe('.cursor/skills/gateguard/SKILL.md')
    expect(agentSkillPath('Copilot', 'gateguard')).toBe('.github/skills/gateguard/SKILL.md')
  })

  it('place les commandes selon l’agent', () => {
    expect(agentCommandPath('Cursor', 'commit')).toBe('.cursor/commands/commit.md')
    expect(agentCommandPath('Copilot', 'commit')).toBe('.github/prompts/commit.md')
  })
})

describe('agentDot', () => {
  it('retourne la pastille connue ou le fallback CSS', () => {
    expect(agentDot('Claude')).toBe('#D97757')
    expect(agentDot('inconnu')).toBe('var(--text-3)')
  })
})
