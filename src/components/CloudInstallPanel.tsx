import { useEffect, useState, type ReactNode } from 'react'
import { useServerFn } from '@tanstack/react-start'
import AgentLogo from '#/components/AgentLogo'
import CliCommandBar from '#/components/CliCommandBar'
import Icon from '#/components/Icon'
import { isAgentName, type AgentName } from '#/lib/agents'
import { COMPAT_ORDER } from '#/lib/catalog'
import {
  downloadCollectionZip,
  downloadCommandZip,
  downloadSkillZip,
  getWorkspaceInstallAvailable,
} from '#/server/functions'

function triggerBase64Download(filename: string, base64: string) {
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  const blob = new Blob([bytes], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

type CloudInstallPanelProps = {
  mode: 'collection' | 'command' | 'skill'
  targetId: string
  lang: 'fr' | 'en'
  agents?: string[]
  cliArgs: string
  t: {
    cloudTitle: string
    cloudHint: string
    downloadZip: (agent: string) => string
    downloading: string
    downloaded: (n: number) => string
    copyCli: string
    copiedCli: string
    localTitle: string
    zipError: string
  }
  /** Boutons install local (workspace) — optionnels, affichés seulement si configuré. */
  localSlot?: ReactNode
}

export default function CloudInstallPanel({
  mode,
  targetId,
  lang,
  agents = [...COMPAT_ORDER],
  cliArgs,
  t,
  localSlot,
}: CloudInstallPanelProps) {
  const workspaceFn = useServerFn(getWorkspaceInstallAvailable)
  const zipCollectionFn = useServerFn(downloadCollectionZip)
  const zipCommandFn = useServerFn(downloadCommandZip)
  const zipSkillFn = useServerFn(downloadSkillZip)

  const [localOk, setLocalOk] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    workspaceFn().then((r) => {
      if (!cancelled) setLocalOk(r.available)
    })
    return () => {
      cancelled = true
    }
  }, [workspaceFn])

  const supported = agents.filter(isAgentName) as AgentName[]

  const handleZip = async (agent: AgentName) => {
    setBusy(agent)
    setError(null)
    setDone(null)
    try {
      const result =
        mode === 'collection'
          ? await zipCollectionFn({ data: { collectionId: targetId, agent, lang } })
          : mode === 'command'
            ? await zipCommandFn({ data: { commandId: targetId, agent } })
            : await zipSkillFn({ data: { skillId: targetId, agent, lang } })

      if (!result.ok) {
        setError(t.zipError)
        return
      }
      triggerBase64Download(result.filename, result.base64)
      setDone(t.downloaded(result.fileCount))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]">
      <div className="mb-1 text-[13px] font-semibold text-[var(--text-1)]">{t.cloudTitle}</div>
      <p className="mb-3 text-[12.5px] leading-[1.45] text-[var(--text-2)]">{t.cloudHint}</p>

      <CliCommandBar args={cliArgs} copyLabel={t.copyCli} copiedLabel={t.copiedCli} className="mb-3 max-w-none" />

      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-3)]">
        ZIP
      </div>
      <div className="flex flex-wrap gap-2">
        {supported.map((agent) => {
          const loading = busy === agent
          return (
            <button
              key={agent}
              type="button"
              disabled={busy !== null}
              title={t.downloadZip(agent)}
              aria-label={t.downloadZip(agent)}
              onClick={() => handleZip(agent)}
              style={{
                cursor: loading ? 'wait' : busy !== null ? 'not-allowed' : 'pointer',
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-2 text-[12.5px] font-medium text-[var(--text-1)] transition-colors hover:border-[var(--border-2)] hover:bg-[var(--surface-hover)] disabled:opacity-60"
            >
              {loading ? (
                <span className="text-[var(--text-3)]">…</span>
              ) : (
                <>
                  <AgentLogo agent={agent} size={16} />
                  <Icon name="download-simple" size={14} className="text-[var(--text-3)]" />
                </>
              )}
            </button>
          )
        })}
      </div>

      {done ? (
        <p className="mt-2 text-[12.5px] text-[var(--accent)]" role="status">
          {done}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-[12.5px] text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}

      {localOk && localSlot ? (
        <div className="mt-4 border-t border-[var(--border)] pt-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-3)]">
            {t.localTitle}
          </div>
          {localSlot}
        </div>
      ) : null}
    </div>
  )
}
