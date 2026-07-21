import type { SecurityRecommendation } from '#/lib/skillspector'
import Icon from '#/components/Icon'

type SecurityBadgeProps = {
  score: number | null
  recommendation?: SecurityRecommendation | null
  size?: 'sm' | 'md'
  showLabel?: boolean
  /** Affiche seulement le score chiffré (ex. pastille compacte). */
  compact?: boolean
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
  SAFE: { fg: '#16a36b', bg: 'rgba(22, 163, 107, 0.14)', border: 'rgba(22, 163, 107, 0.4)', icon: 'shield-check' },
  CAUTION: { fg: '#c9851a', bg: 'rgba(201, 133, 26, 0.14)', border: 'rgba(201, 133, 26, 0.45)', icon: 'warning' },
  UNSAFE: { fg: '#da3b4a', bg: 'rgba(218, 59, 74, 0.14)', border: 'rgba(218, 59, 74, 0.45)', icon: 'shield-warning' },
  UNKNOWN: { fg: '#8a909b', bg: 'rgba(138, 144, 155, 0.12)', border: 'rgba(138, 144, 155, 0.4)', icon: 'shield' },
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

  const pad = size === 'md' ? 'px-2.5 py-1 text-[12px]' : 'px-2 py-0.5 text-[11px]'
  const iconSize = size === 'md' ? 13 : 11

  if (compact) {
    return (
      <span
        className="inline-flex h-[22px] min-w-[38px] items-center justify-center gap-0.5 rounded-md border px-1.5 font-mono text-[11px] font-bold tabular-nums"
        style={{ color: style.fg, borderColor: style.border, background: style.bg }}
        title={score != null ? labels.score(score) : labels.unscanned}
      >
        <Icon name={style.icon} bold size={10} />
        {score != null ? score : '—'}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-full border font-mono font-semibold ${pad}`}
      style={{ color: style.fg, borderColor: style.border, background: style.bg }}
      title={score != null ? labels.score(score) : labels.unscanned}
    >
      <Icon name={style.icon} bold size={iconSize} />
      {showLabel ? <span className="truncate">{label}</span> : null}
      {score != null ? <span className="tabular-nums opacity-90">{score}</span> : null}
    </span>
  )
}
