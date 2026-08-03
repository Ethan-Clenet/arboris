import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import AgentLogo from '#/components/AgentLogo'
import { agentSkillPath, isAgentName } from '#/lib/agents'
import type { Lang } from '#/lib/catalog'
import { needsInstallConfirm, needsInstallWarning } from '#/lib/skillspector'
import { installSkill, type InstallSkillError } from '#/server/functions'

interface SkillInstallButtonsProps {
  skillId: string
  score: number | null
  agents: string[]
  lang: Lang
  t: {
    installTitle: string
    install: (agent: string) => string
    installed: (path: string) => string
    installWarn: string
    installConfirm: string
    installConfirmYes: string
    installConfirmNo: string
    errors: Record<InstallSkillError, string>
  }
}

export default function SkillInstallButtons({
  skillId,
  score,
  agents,
  lang,
  t,
}: SkillInstallButtonsProps) {
  const installFn = useServerFn(installSkill)
  const [busy, setBusy] = useState<string | null>(null)
  const [done, setDone] = useState<{ agent: string; path: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingAgent, setPendingAgent] = useState<string | null>(null)

  const supported = agents.filter(isAgentName)
  if (supported.length === 0) return null

  const warn = needsInstallWarning(score)
  const confirmRequired = needsInstallConfirm(score)

  const runInstall = async (agent: string, acknowledged: boolean) => {
    if (!isAgentName(agent)) return
    setBusy(agent)
    setError(null)
    setDone(null)
    try {
      const result = await installFn({
        data: { skillId, agent, lang, acknowledgeRisk: acknowledged },
      })
      if (!result.ok) {
        if (result.error === 'security_blocked') {
          setPendingAgent(agent)
          return
        }
        setError(t.errors[result.error] ?? t.errors.generic)
        return
      }
      setPendingAgent(null)
      setDone({ agent, path: result.path })
    } finally {
      setBusy(null)
    }
  }

  const handleInstall = async (agent: string) => {
    if (confirmRequired && pendingAgent !== agent) {
      setPendingAgent(agent)
      setError(null)
      setDone(null)
      return
    }
    await runInstall(agent, confirmRequired)
  }

  return (
    <div className="mt-4 w-full">
      <p className="mb-2 text-[12.5px] font-medium text-[var(--text-2)]">{t.installTitle}</p>
      {warn && !confirmRequired ? (
        <p className="mb-2 text-[12px] text-[#E5A53B]" role="status">
          {t.installWarn}
        </p>
      ) : null}
      {pendingAgent && confirmRequired ? (
        <div className="mb-2 rounded-lg border border-[color-mix(in_srgb,#E5484D_35%,transparent)] bg-[color-mix(in_srgb,#E5484D_10%,transparent)] px-3 py-2">
          <p className="mb-2 text-[12.5px] text-[var(--danger,#E5484D)]">{t.installConfirm}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[12px] font-medium"
              onClick={() => setPendingAgent(null)}
            >
              {t.installConfirmNo}
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-md border border-[color-mix(in_srgb,#E5484D_40%,transparent)] bg-[color-mix(in_srgb,#E5484D_18%,transparent)] px-2.5 py-1 text-[12px] font-semibold text-[var(--danger,#E5484D)]"
              onClick={() => runInstall(pendingAgent, true)}
            >
              {t.installConfirmYes}
            </button>
          </div>
        </div>
      ) : null}
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
              aria-label={t.install(agent)}
              onClick={() => handleInstall(agent)}
              className={`inline-flex cursor-pointer items-center justify-center rounded-lg border p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                active
                  ? 'border-[var(--accent-border)] bg-[var(--accent-soft)]'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              {loading ? (
                <span className="grid h-[18px] w-[18px] place-items-center text-[13px] text-[var(--text-3)]">…</span>
              ) : active ? (
                <span className="grid h-[18px] w-[18px] place-items-center text-[13px] text-[var(--accent)]">✓</span>
              ) : (
                <AgentLogo agent={agent} size={18} />
              )}
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
