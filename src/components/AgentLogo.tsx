import { isAgentName, type AgentName } from '#/lib/agents'
import { AGENT_LOGO_PATH, agentLogoColor } from '#/lib/agent-logos'

/** Sprite unique — évite de répéter ~1,5 Mo de paths SVG sur /skills. */
export function AgentLogoSprite() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden"
    >
      <defs>
        {(Object.entries(AGENT_LOGO_PATH) as [AgentName, string][]).map(([name, d]) => (
          <symbol key={name} id={`agent-logo-${name}`} viewBox="0 0 24 24">
            <path fill="currentColor" d={d} />
          </symbol>
        ))}
      </defs>
    </svg>
  )
}

type AgentLogoProps = {
  agent: AgentName | string
  size?: number
  className?: string
  title?: string
}

export default function AgentLogo({ agent, size = 16, className = '', title }: AgentLogoProps) {
  if (!isAgentName(agent)) {
    return (
      <span
        className={`inline-grid place-items-center rounded-full bg-[var(--surface-2)] font-mono text-[9px] font-semibold uppercase text-[var(--text-3)] ${className}`}
        style={{ width: size, height: size }}
        title={title ?? agent}
      >
        {agent.slice(0, 1)}
      </span>
    )
  }

  const label = title ?? agent

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={label}
      className={`shrink-0 ${className}`}
      style={{ color: agentLogoColor(agent) }}
    >
      <use href={`#agent-logo-${agent}`} />
    </svg>
  )
}

type AgentBadgeProps = {
  agent: AgentName | string
  active?: boolean
  size?: number
  onClick?: () => void
  className?: string
}

export function AgentBadge({ agent, active = false, size = 16, onClick, className = '' }: AgentBadgeProps) {
  const label = isAgentName(agent) ? agent : agent
  const base =
    'inline-flex items-center justify-center rounded-full border px-2 py-1 transition-colors'
  const styles = active
    ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent-border)]'
    : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)]'

  if (onClick) {
    return (
      <button
        type="button"
        aria-pressed={active}
        aria-label={label}
        title={label}
        onClick={onClick}
        className={`${base} cursor-pointer ${styles} ${className}`}
      >
        <AgentLogo agent={agent} size={size} />
      </button>
    )
  }

  return (
    <span className={`${base} ${styles} ${className}`} aria-label={label} title={label}>
      <AgentLogo agent={agent} size={size} />
    </span>
  )
}

type AgentCompatListProps = {
  agents: string[]
  max?: number
  size?: number
  className?: string
}

const COMPAT_SLOT_ORDER: AgentName[] = ['Claude', 'Cursor', 'Codex', 'Copilot']

export function AgentCompatList({ agents, max = 4, size = 14, className = '' }: AgentCompatListProps) {
  const known = new Set(agents.filter(isAgentName))
  const slots = COMPAT_SLOT_ORDER.slice(0, max)
  const extras = agents.filter(isAgentName).filter((a) => !slots.includes(a)).length

  if (!known.size) return <span className="text-[var(--text-3)]">—</span>

  return (
    <span className={`inline-flex h-[22px] shrink-0 items-center gap-1.5 ${className}`}>
      {slots.map((agent) =>
        known.has(agent) ? (
          <AgentLogo key={agent} agent={agent} size={size} />
        ) : (
          <span
            key={agent}
            className="inline-block shrink-0 rounded-full bg-[var(--surface-2)] opacity-35"
            style={{ width: size, height: size }}
            aria-hidden
          />
        ),
      )}
      {extras > 0 ? <span className="font-mono text-[11px] leading-none text-[var(--text-3)]">+{extras}</span> : null}
    </span>
  )
}

export function AgentLogoRow({
  agents,
  size = 16,
  className = '',
}: {
  agents: readonly string[]
  size?: number
  className?: string
}) {
  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      {agents.map((agent) => (
        <AgentBadge key={agent} agent={agent} size={size} />
      ))}
    </span>
  )
}
