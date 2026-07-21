import { COMPAT_DOT } from '#/lib/catalog'

export type AgentName = 'Claude' | 'Cursor' | 'Codex' | 'Copilot'

/** Chemin relatif du SKILL.md pour chaque agent. */
export const AGENT_SKILL_PATH: Record<AgentName, (skillId: string) => string> = {
  Cursor: (id) => `.cursor/skills/${id}/SKILL.md`,
  Claude: (id) => `.claude/skills/${id}/SKILL.md`,
  Codex: (id) => `.agents/skills/${id}/SKILL.md`,
  Copilot: (id) => `.github/skills/${id}/SKILL.md`,
}

/** Chemin relatif d’une slash command (prompt Markdown) pour chaque agent. */
export const AGENT_COMMAND_PATH: Record<AgentName, (commandId: string) => string> = {
  Cursor: (id) => `.cursor/commands/${id}.md`,
  Claude: (id) => `.claude/commands/${id}.md`,
  Codex: (id) => `.agents/commands/${id}.md`,
  Copilot: (id) => `.github/prompts/${id}.md`,
}

export const AGENT_ICON: Record<AgentName, string> = {
  Claude: 'sparkle',
  Cursor: 'cursor',
  Codex: 'code',
  Copilot: 'github-logo',
}

export function agentDot(name: string): string {
  return COMPAT_DOT[name] ?? 'var(--text-3)'
}

export function isAgentName(name: string): name is AgentName {
  return name in AGENT_SKILL_PATH
}

export function agentSkillPath(agent: AgentName, skillId: string): string {
  return AGENT_SKILL_PATH[agent](skillId)
}

export function agentCommandPath(agent: AgentName, commandId: string): string {
  return AGENT_COMMAND_PATH[agent](commandId)
}
