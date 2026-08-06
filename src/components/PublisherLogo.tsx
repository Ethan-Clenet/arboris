import { publisherLogoAsset } from '#/lib/publisher-logos'

type PublisherLogoProps = {
  name: string
  size?: number
  className?: string
  /** @deprecated ignoré — les logos sont toujours hors thème. */
  inherit?: boolean
}

/**
 * Logo marque, **exclu du dark theme** :
 * pastille claire fixe (`color-scheme: light`) + asset SVG dédié.
 * Les couleurs marque ne dépendent jamais de `--text-*` / `currentColor`.
 */
export default function PublisherLogo({ name, size = 14, className = '' }: PublisherLogoProps) {
  const asset = publisherLogoAsset(name)
  if (!asset) return null

  const box = Math.round(size + 8)

  return (
    <span
      className={`publisher-logo-mark inline-grid shrink-0 place-items-center ${className}`.trim()}
      style={{ width: box, height: box }}
      title={name}
    >
      <img
        src={asset}
        alt=""
        width={size}
        height={size}
        className="block max-h-full max-w-full object-contain"
        draggable={false}
      />
    </span>
  )
}
