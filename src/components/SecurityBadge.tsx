import { scoreColor } from '#/lib/catalog'
import type { SecurityRecommendation } from '#/lib/skillspector'
import Icon from '#/components/Icon'

type SecurityBadgeProps = {
  score: number | null
  recommendation?: SecurityRecommendation | null
  size?: 'sm' | 'md'
  showLabel?: boolean
  labels: {
    unscanned: string
    safe: string
    caution: string
    unsafe: string
    score: (n: number) => string
  }
}

function resolveTone(
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
  labels,
}: SecurityBadgeProps) {
  const tone = resolveTone(score, recommendation)
  const color = scoreColor(score)
  const label =
    tone === 'SAFE'
      ? labels.safe
      : tone === 'CAUTION'
        ? labels.caution
        : tone === 'UNSAFE'
          ? labels.unsafe
          : labels.unscanned

  const icon =
    tone === 'SAFE' ? 'shield-check' : tone === 'CAUTION' ? 'warning' : tone === 'UNSAFE' ? 'shield-warning' : 'shield'

  const pad = size === 'md' ? 'px-2.5 py-1 text-[12px]' : 'px-2 py-0.5 text-[11px]'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-mono font-semibold ${pad}`}
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
      }}
      title={score != null ? labels.score(score) : labels.unscanned}
    >
      <Icon name={icon} bold size={size === 'md' ? 13 : 11} />
      {showLabel ? <span>{label}</span> : null}
      {score != null ? <span className="opacity-80">{score}</span> : null}
    </span>
  )
}
