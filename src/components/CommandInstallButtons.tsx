import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import AgentLogo from '#/components/AgentLogo'
import { agentCommandPath, isAgentName } from '#/lib/agents'
import type { Lang } from '#/lib/catalog'
import { clientInstallToken } from '#/lib/install-token'
import { installCommand, type InstallCommandError } from '#/server/functions'

interface CommandInstallButtonsProps {
  commandId: string
  agents: string[]
  lang: Lang
  t: {
    installTitle: string
    install: (agent: string) => string
    installed: (path: string) => string
    usageHint: string
    errors: Record<InstallCommandError, string>
  }
}

export default function CommandInstallButtons({
  commandId,
  agents,
  lang,
  t,
}: CommandInstallButtonsProps) {
  const installFn = useServerFn(installCommand)
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
      const result = await installFn({
        data: { commandId, agent, lang, installToken: clientInstallToken() },
      })
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
          const path = agentCommandPath(agent, commandId)
          return (
            <button
              key={agent}
              type="button"
              disabled={busy !== null}
              title={path}
              aria-label={t.install(agent)}
              onClick={() => handleInstall(agent)}
              style={{
                cursor: loading ? 'wait' : busy !== null ? 'not-allowed' : 'pointer',
              }}
              className={`inline-flex items-center justify-center rounded-lg border p-2 transition-colors disabled:opacity-60 ${
                active
                  ? 'border-[var(--accent-border)] bg-[var(--accent-soft)]'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              {loading ? (
                <span className="grid h-[18px] w-[18px] place-items-center text-[13px] text-[var(--text-3)]">…</span>
              ) : active ? (
                <span className="grid h-[18px] w-[18px] place-items-center text-[13px] text-[var(--accent-text)]">✓</span>
              ) : (
                <AgentLogo agent={agent} size={18} />
              )}
            </button>
          )
        })}
      </div>
      {done ? (
        <p className="mt-2 text-[12.5px] text-[var(--accent-text)]" role="status">
          {t.installed(done.path)}
        </p>
      ) : null}
      <p className="mt-2 text-[12px] text-[var(--text-3)]">{t.usageHint}</p>
      {error ? (
        <p className="mt-2 text-[12.5px] text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
