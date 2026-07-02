import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import Icon from '#/components/Icon'
import { agentDot, agentSkillPath, AGENT_ICON, isAgentName } from '#/lib/agents'
import type { Lang } from '#/lib/catalog'
import { installSkill, type InstallSkillError } from '#/server/functions'

interface SkillInstallButtonsProps {
  skillId: string
  agents: string[]
  lang: Lang
  t: {
    installTitle: string
    install: (agent: string) => string
    installed: (path: string) => string
    errors: Record<InstallSkillError, string>
  }
}

export default function SkillInstallButtons({ skillId, agents, lang, t }: SkillInstallButtonsProps) {
  const installFn = useServerFn(installSkill)
  const [busy, setBusy] = useState<string | null>(null)
  const [done, setDone] = useState<{ agent: string; path: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supported = agents.filter(isAgentName)
  if (supported.length === 0) return null

  const handleInstall = async (agent: string) => {
    if (!isAgentName(agent)) return
    setBusy(agent)
    setError(null)
    setDone(null)
    try {
      const result = await installFn({ data: { skillId, agent, lang } })
      if (!result.ok) {
        setError(t.errors[result.error] ?? t.errors.generic)
        return
      }
      setDone({ agent, path: result.path })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mt-4 w-full">
      <p className="mb-2 text-[12.5px] font-medium text-[var(--text-2)]">{t.installTitle}</p>
      <div className="flex flex-wrap gap-2">
        {supported.map((agent) => {
          const active = done?.agent === agent
          const loading = busy === agent
          const path = agentSkillPath(agent, skillId)
          return (
            <button
              key={agent}
              type="button"
              disabled={busy !== null}
              title={path}
              onClick={() => handleInstall(agent)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                active
                  ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-1)] hover:border-[var(--border-2)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <span
                className="grid h-5 w-5 place-items-center rounded-md"
                style={{
                  background: `color-mix(in srgb, ${agentDot(agent)} 18%, transparent)`,
                  color: agentDot(agent),
                }}
              >
                <Icon name={AGENT_ICON[agent]} bold size={12} />
              </span>
              {loading ? '…' : active ? '✓' : null}
              {t.install(agent)}
            </button>
          )
        })}
      </div>
      {done ? (
        <p className="mt-2 text-[12.5px] text-[var(--accent)]" role="status">
          {t.installed(done.path)}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-[12.5px] text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
