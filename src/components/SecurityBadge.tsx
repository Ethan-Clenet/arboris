import type { SecurityRecommendation } from '#/lib/skillspector'
import Icon from '#/components/Icon'

type SecurityBadgeProps = {
  score: number | null
  recommendation?: SecurityRecommendation | null
  size?: 'sm' | 'md'
  showLabel?: boolean
  /** Affiche seulement le score chiffré (ex. pastille compacte). */
  compact?: boolean
  className?: string
  labels: {
    unscanned: string
    safe: string
    caution: string
    unsafe: string
    score: (n: number) => string
  }
}

type ToneStyle = {
  fg: string
  bg: string
  border: string
  icon: string
}

const TONE_STYLES: Record<SecurityRecommendation, ToneStyle> = {
  SAFE: { fg: 'var(--security-safe-fg)', bg: 'var(--security-safe-bg)', border: 'var(--security-safe-border)', icon: 'shield-check' },
  CAUTION: { fg: 'var(--security-caution-fg)', bg: 'var(--security-caution-bg)', border: 'var(--security-caution-border)', icon: 'warning' },
  UNSAFE: { fg: 'var(--security-unsafe-fg)', bg: 'var(--security-unsafe-bg)', border: 'var(--security-unsafe-border)', icon: 'shield-warning' },
  UNKNOWN: { fg: 'var(--security-unknown-fg)', bg: 'var(--security-unknown-bg)', border: 'var(--security-unknown-border)', icon: 'shield' },
}

export function resolveSecurityTone(
  score: number | null,
  recommendation: SecurityRecommendation | null | undefined,
): SecurityRecommendation {
  if (recommendation && recommendation !== 'UNKNOWN') return recommendation
  if (score == null) return 'UNKNOWN'
  if (score >= 70) return 'SAFE'
  if (score >= 50) return 'CAUTION'
  return 'UNSAFE'
}

export default function SecurityBadge({
  score,
  recommendation,
  size = 'sm',
  showLabel = true,
  compact = false,
  className = '',
  labels,
}: SecurityBadgeProps) {
  const tone = resolveSecurityTone(score, recommendation)
  const style = TONE_STYLES[tone]
  const label =
    tone === 'SAFE'
      ? labels.safe
      : tone === 'CAUTION'
        ? labels.caution
        : tone === 'UNSAFE'
          ? labels.unsafe
          : labels.unscanned

  const iconSize = size === 'md' ? 13 : 11
  const title = score != null ? labels.score(score) : labels.unscanned

  if (compact) {
    return (
      <span
        className={`inline-flex h-[22px] w-[42px] shrink-0 items-center justify-center gap-0.5 rounded-md border font-mono text-[11px] font-bold tabular-nums leading-none ${className}`}
        style={{ color: style.fg, borderColor: style.border, background: style.bg }}
        title={title}
      >
        <Icon name={style.icon} bold size={10} />
        <span className="min-w-[1.35rem] text-center">{score != null ? score : '—'}</span>
      </span>
    )
  }

  const sizeClass =
    size === 'md'
      ? 'h-7 w-[8.5rem] gap-1.5 px-2.5 text-[12px]'
      : 'h-[22px] w-[8rem] gap-1 px-2 text-[11px]'

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border font-mono font-semibold leading-none ${sizeClass} ${className}`}
      style={{ color: style.fg, borderColor: style.border, background: style.bg }}
      title={title}
    >
      <Icon name={style.icon} bold size={iconSize} />
      {showLabel ? <span className="truncate">{label}</span> : null}
      <span className="inline-block min-w-[1.5rem] text-center tabular-nums opacity-90">
        {score != null ? score : '—'}
      </span>
    </span>
  )
}
