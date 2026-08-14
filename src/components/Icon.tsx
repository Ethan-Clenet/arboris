import type { CSSProperties } from 'react'
import { PHOSPHOR_SPRITE_PATHS } from '#/generated/phosphor-sprite'

interface IconProps {
  name: string
  bold?: boolean
  size?: number | string
  color?: string
  className?: string
  style?: CSSProperties
}

function spriteId(name: string, bold: boolean): string {
  const id = bold ? `ph-bold-${name}` : `ph-${name}`
  if (PHOSPHOR_SPRITE_PATHS[id]) return id
  return bold ? 'ph-bold-fallback' : 'ph-fallback'
}

/** Sprite SVG caché — une seule copie des glyphes Phosphor utilisés. */
export function PhosphorSprite() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden"
    >
      <defs>
        {Object.entries(PHOSPHOR_SPRITE_PATHS).map(([id, paths]) => (
          <symbol key={id} id={id} viewBox="0 0 256 256">
            {paths.map((d) => (
              <path key={d.slice(0, 24)} fill="currentColor" d={d} />
            ))}
          </symbol>
        ))}
      </defs>
    </svg>
  )
}

/** Icône Phosphor locale (sprite auto-généré, sans webfont). */
export default function Icon({
  name,
  bold = false,
  size = 16,
  color,
  className = '',
  style,
}: IconProps) {
  const px = typeof size === 'number' ? `${size}px` : size
  const id = spriteId(name, bold)

  return (
    <svg
      aria-hidden="true"
      width={px}
      height={px}
      viewBox="0 0 256 256"
      className={`inline-block shrink-0 ${className}`.trim()}
      style={{ color, ...style }}
    >
      <use href={`#${id}`} />
    </svg>
  )
}
