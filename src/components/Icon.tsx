import type { CSSProperties } from 'react'

/** Sprite SVG externe — hors HTML critique (LCP / parse). */
export const PHOSPHOR_SPRITE_HREF = '/phosphor-sprite.svg'

interface IconProps {
  name: string
  bold?: boolean
  size?: number | string
  color?: string
  className?: string
  style?: CSSProperties
}

function spriteId(name: string, bold: boolean): string {
  return bold ? `ph-bold-${name}` : `ph-${name}`
}

/**
 * Ancien sprite inline — conservé no-op pour les imports AppShell existants.
 * Les glyphes vivent dans `public/phosphor-sprite.svg`.
 */
export function PhosphorSprite() {
  return null
}

/** Icône Phosphor locale (sprite externe, sans webfont). */
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
      <use href={`${PHOSPHOR_SPRITE_HREF}#${id}`} />
    </svg>
  )
}
