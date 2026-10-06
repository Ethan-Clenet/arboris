import type { CSSProperties } from 'react'
import {
  PUBLISHER_LOGO_COLOR,
  PUBLISHER_LOGO_PATH,
  publisherLogoAsset,
  publisherLogoIsNative,
  publisherLogoPaint,
  resolvePublisherLogoName,
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

function silhouetteMaskStyle(asset: string, size: number, fill: string): CSSProperties {
  const mask = `url("${asset}") center / contain no-repeat`
  return {
    width: size,
    height: size,
    backgroundColor: fill,
    WebkitMask: mask,
    mask,
  }
}

/**
 * Logo marque d’éditeur.
 * Préfère les SVG officiels multicolores (`/publishers/*.svg`) quand dispo
 * (ex. Brave orange + visage blanc). Les silhouettes Simple Icons sont des
 * fichiers SVG masqués en CSS (couleur marque, HTML léger).
 */
export default function PublisherLogo({
  name,
  size = 14,
  className = '',
  inherit = false,
  alt,
}: PublisherLogoProps) {
  const resolved = resolvePublisherLogoName(name) ?? name
  const altText = alt ?? `Logo ${resolved}`
  const asset = publisherLogoAsset(resolved)
  if (asset && !inherit && publisherLogoIsNative(resolved)) {
    return (
      <img
        src={asset}
        alt={altText}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={`block object-contain ${className}`.trim()}
        draggable={false}
      />
    )
  }

  if (asset && !inherit) {
    return (
      <span
        role="img"
        aria-label={altText}
        className={`block shrink-0 ${className}`.trim()}
        style={silhouetteMaskStyle(asset, size, publisherLogoPaint(resolved))}
      />
    )
  }

  const path = PUBLISHER_LOGO_PATH[resolved]
  if (!path) return null
  const fill = inherit ? 'currentColor' : (PUBLISHER_LOGO_COLOR[resolved] ?? 'currentColor')

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
