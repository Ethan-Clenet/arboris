import Icon from '#/components/Icon'
import PublisherLogo from '#/components/PublisherLogo'
import Toast from '#/components/Toast'
import { hasPublisherLogo } from '#/lib/publisher-logos'
import type { SkillGithubSource } from '#/lib/skill-github'
import { useCopy } from '#/lib/useCopy'

type SkillGithubCardProps = {
  source: SkillGithubSource
  /** Nom affiché (éditeur / propriétaire). */
  title: string
  /** Publisher pour le logo, si connu. */
  publisher?: string | null
  openLabel: string
  shareLabel: string
  sharedLabel: string
  className?: string
}

function ownerFromRepo(repo: string | null): string | null {
  if (!repo) return null
  const owner = repo.split('/')[0]
  return owner || null
}

export default function SkillGithubCard({
  source,
  title,
  publisher,
  openLabel,
  shareLabel,
  sharedLabel,
  className = '',
}: SkillGithubCardProps) {
  const { copiedKey, copy } = useCopy(1600)
  const shared = copiedKey === source.url
  const logoName = publisher && hasPublisherLogo(publisher) ? publisher : null
  const initial = (title.trim()[0] || ownerFromRepo(source.repo)?.[0] || 'A').toUpperCase()

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] ${className}`.trim()}
    >
      <div className="flex items-start gap-3 px-4 pt-4 pb-3.5">
        <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-2)]">
          {logoName ? (
            <PublisherLogo name={logoName} size={24} />
          ) : (
            <span className="font-display text-[16px] font-semibold text-[var(--text-2)]">{initial}</span>
          )}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="truncate text-[15px] font-semibold tracking-tight text-[var(--text-1)]">{title}</div>
          {source.repo ? (
            <div className="mt-0.5 truncate font-mono text-[12px] text-[var(--text-3)]">{source.repo}</div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => copy(source.url, source.url, sharedLabel)}
          aria-label={shareLabel}
          title={shareLabel}
          className={`grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg border transition-colors ${
            shared
              ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-3)] hover:border-[var(--border-2)] hover:text-[var(--text-1)]'
          }`}
        >
          <Icon name={shared ? 'check' : 'share-network'} size={15} />
        </button>
      </div>

      <div className="px-4 pb-4">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-[13.5px] font-semibold text-[var(--text-1)] transition-colors hover:border-[var(--border-2)] hover:bg-[var(--surface-hover)]"
        >
          <Icon name="github-logo" bold size={17} />
          <span>{openLabel}</span>
        </a>
      </div>
      <Toast show={shared} text={sharedLabel} />
    </div>
  )
}
