import { PUBLISHER_LOGO_COLOR, PUBLISHER_LOGO_PATH } from '#/lib/publisher-logos'

type PublisherLogoProps = {
  name: string
  size?: number
  className?: string
  /** Remplit avec currentColor (hérité) au lieu de la couleur marque. */
  inherit?: boolean
}

/** Logo marque d’un éditeur (ex. Brave) — fallback null si inconnu. */
export default function PublisherLogo({
  name,
  size = 14,
  className = '',
  inherit = false,
}: PublisherLogoProps) {
  const path = PUBLISHER_LOGO_PATH[name]
  if (!path) return null
  const fill = inherit ? 'currentColor' : (PUBLISHER_LOGO_COLOR[name] ?? 'currentColor')

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
      <path fill={fill} d={path} />
    </svg>
  )
}
