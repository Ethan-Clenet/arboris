import { PUBLISHER_LOGO_COLOR, PUBLISHER_LOGO_PATH } from '#/lib/publisher-logos'

type PublisherLogoProps = {
  name: string
  size?: number
  className?: string
  /** Remplit avec currentColor (hérité) au lieu de la couleur marque. */
  inherit?: boolean
}

function isNearWhite(fill: string): boolean {
  const f = fill.trim().toLowerCase()
  return f === '#fff' || f === '#ffffff' || f === '#f4f4f5' || f === '#ededed' || f === 'currentcolor'
}

/**
 * Logos marque (Simple Icons / paths custom).
 *
 * Sur fond sombre, les découpes SVG (visage Brave, étoile Auth0…) laissent
 * transparaître le noir et cassent le logo. On pose d’abord une silhouette
 * claire (nonzero), puis la couleur marque en evenodd — comme sur les sites
 * qui affichent Brave en orange + blanc.
 */
export default function PublisherLogo({
  name,
  size = 14,
  className = '',
  inherit = false,
}: PublisherLogoProps) {
  const path = PUBLISHER_LOGO_PATH[name]
  if (!path) return null
  const fill = inherit ? 'currentColor' : (PUBLISHER_LOGO_COLOR[name] ?? 'currentColor')
  const cutoutUnderlay = !inherit && !isNearWhite(fill)

  return (
    <svg
      role="img"
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{name}</title>
      {cutoutUnderlay ? <path d={path} fill="#F4F4F5" fillRule="nonzero" /> : null}
      <path d={path} fill={fill} fillRule="evenodd" />
    </svg>
  )
}
