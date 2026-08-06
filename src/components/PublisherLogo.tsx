import {
  PUBLISHER_LOGO_COLOR,
  PUBLISHER_LOGO_PATH,
  publisherLogoAsset,
} from '#/lib/publisher-logos'
import Icon from '#/components/Icon'

type PublisherLogoProps = {
  name: string
  size?: number
  className?: string
  /** Remplit avec currentColor (hérité) au lieu de la couleur marque. */
  inherit?: boolean
  /**
   * Sans pastille claire (défaut : false).
   * Les logos sont exclus du dark theme via un fond blanc + color-scheme: light.
   */
  bare?: boolean
}

/** Couleurs adaptées à un fond clair (badge hors dark theme). */
function fillOnLight(name: string, inherit: boolean): string {
  if (inherit) return 'currentColor'
  // Vercel / logos clairs → noir sur pastille blanche
  if (name === 'Vercel') return '#000000'
  return PUBLISHER_LOGO_COLOR[name] ?? 'currentColor'
}

/**
 * Logo marque d’éditeur.
 * Toujours rendu sur pastille blanche (`color-scheme: light`) pour exclure
 * le dark theme — couleurs marque stables quel que soit le thème UI.
 */
export default function PublisherLogo({
  name,
  size = 14,
  className = '',
  inherit = false,
  bare = false,
}: PublisherLogoProps) {
  const asset = publisherLogoAsset(name)
  const mark = asset && !inherit ? (
    <img
      src={asset}
      alt=""
      width={size}
      height={size}
      className="block object-contain"
      draggable={false}
    />
  ) : PUBLISHER_LOGO_PATH[name] ? (
    <svg
      role="img"
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{name}</title>
      <path fill={fillOnLight(name, inherit)} d={PUBLISHER_LOGO_PATH[name]} />
    </svg>
  ) : null

  if (!mark) return null

  if (bare) {
    return <span className={className}>{mark}</span>
  }

  const pad = Math.max(3, Math.round(size * 0.18))
  const box = size + pad * 2

  return (
    <span
      className={`publisher-logo-badge inline-grid shrink-0 place-items-center rounded-[6px] ${className}`.trim()}
      style={{ width: box, height: box, padding: pad }}
      title={name}
    >
      {mark}
    </span>
  )
}

/** Icône Phosphor sur pastille claire — même traitement hors dark que les logos marque. */
export function PublisherLogoFallback({
  icon,
  color,
  size = 14,
  className = '',
}: {
  icon: string
  color?: string
  size?: number
  className?: string
}) {
  const pad = Math.max(3, Math.round(size * 0.18))
  const box = size + pad * 2
  return (
    <span
      className={`publisher-logo-badge inline-grid shrink-0 place-items-center rounded-[6px] ${className}`.trim()}
      style={{ width: box, height: box, padding: pad, color: color ?? '#5a616c' }}
    >
      <Icon name={icon} size={size} />
    </span>
  )
}
