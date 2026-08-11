import {
  PUBLISHER_LOGO_COLOR,
  PUBLISHER_LOGO_PATH,
  publisherLogoAsset,
} from '#/lib/publisher-logos'

type PublisherLogoProps = {
  name: string
  size?: number
  className?: string
  /** Remplit avec currentColor (hérité) au lieu de la couleur marque. */
  inherit?: boolean
  /** Texte alternatif ; défaut : « Logo {name} ». */
  alt?: string
}

/**
 * Logo marque d’éditeur.
 * Préfère les SVG officiels multicolores (`/publishers/*.svg`) quand dispo
 * (ex. Brave orange + visage blanc). Sinon path monochrome Simple Icons.
 */
export default function PublisherLogo({
  name,
  size = 14,
  className = '',
  inherit = false,
  alt,
}: PublisherLogoProps) {
  const altText = alt ?? `Logo ${name}`
  const asset = publisherLogoAsset(name)
  if (asset && !inherit) {
    return (
      <img
        src={asset}
        alt={altText}
        width={size}
        height={size}
        className={`block object-contain ${className}`.trim()}
        draggable={false}
      />
    )
  }

  const path = PUBLISHER_LOGO_PATH[name]
  if (!path) return null
  const fill = inherit ? 'currentColor' : (PUBLISHER_LOGO_COLOR[name] ?? 'currentColor')

  return (
    <svg
      role="img"
      aria-label={altText}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{altText}</title>
      <path fill={fill} d={path} />
    </svg>
  )
}
